<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%--
    이 파일은 웹스퀘어(WebSquare)와 같은 외부 시스템에 포함(include)되어
    카카오맵을 표시하고 제어하는 역할을 하는 지도 컴포넌트입니다.
    외부에서 행정구역 코드를 전달받아 해당 위치로 지도를 이동시키는 기능을 제공합니다.
--%>

<%-- 지도 UI가 그려질 HTML 컨테이너 요소입니다. --%>
<div id="websquareMapContainer" style="width:100%; height:100%;"></div>

<%--
    카카오맵 JavaScript SDK를 로드합니다.
    - 'appkey': 카카오 개발자 센터에서 발급받은 JavaScript 키입니다.
    - 'libraries=services': 주소-좌표 변환과 같은 추가 서비스를 사용하기 위해 반드시 포함해야 합니다.
--%>
<script type="text/javascript"
        src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=a1194f70f6ecf2ece7a703a4a07a0876&libraries=services"></script>

<%-- 지도 제어를 위한 메인 스크립트입니다. --%>
<script>
    /**
     * @description 즉시 실행 함수(IIFE, Immediately Invoked Function Expression)
     * 이 코드는 파일이 로드되자마자 즉시 실행됩니다.
     * 내부 변수(websquareMap, geocoder 등)가 외부(전역 스코프)와 충돌하는 것을 방지하여 코드의 안정성을 높입니다.
     */
    (function () {
        // 지도 객체를 저장할 변수. 지도 API의 핵심 객체입니다.
        let websquareMap = null;
        // 주소를 좌표로, 또는 좌표를 주소로 변환하는 지오코더 객체를 저장할 변수입니다.
        let geocoder = null;
        // JSP 표현식을 통해 웹 애플리케이션의 컨텍스트 경로(예: /psim-web)를 가져옵니다.
        // API 호출 시 절대 경로를 만들기 위해 사용됩니다.
        const contextPath = '<%= request.getContextPath() %>';

        /**
         * @description 지도와 지오코더 객체를 생성하고 초기화하는 함수입니다.
         *              Kakao Maps SDK가 완전히 로드된 후 `kakao.maps.load()`에 의해 호출됩니다.
         */
        function initWebsquareMap() {
            // HTML에서 지도가 표시될 div 요소를 찾습니다.
            const container = document.getElementById('websquareMapContainer');
            if (!container) {
                // 컨테이너가 없으면 지도를 생성할 수 없으므로, 콘솔에 에러를 출력하고 함수를 종료합니다.
                console.error('[지도 오류] 지도 컨테이너(#websquareMapContainer)를 찾을 수 없습니다.');
                return;
            }

            // 지도 생성 시 필요한 기본 옵션을 설정합니다.
            const options = {
                center: new kakao.maps.LatLng(37.5665, 126.9780), // 초기 중심 좌표 (서울시청)
                level: 7 // 초기 지도 확대 레벨 (값이 클수록 멀리서 보임)
            };

            // 설정한 옵션으로 지도 객체를 생성하여 `websquareMap` 변수에 할당합니다.
            websquareMap = new kakao.maps.Map(container, options);
            // 주소 검색을 위한 지오코더 객체를 생성합니다.
            geocoder = new kakao.maps.services.Geocoder();

            console.log('WebSquare용 Kakao Map 및 Geocoder가 성공적으로 초기화되었습니다.');
        }

        /**
         * @description 행정구역 코드에 해당하는 명칭(예: '11' -> '서울특별시')을 서버 API를 통해 비동기적으로 가져옵니다.
         *              async/await 문법을 사용하여 비동기 통신을 동기 코드처럼 쉽게 작성할 수 있습니다.
         * @param {string} type - 조회할 코드의 종류 ('sido', 'sigungu', 'emd')
         * @param {string} code - 조회할 행정구역 코드 (예: '11', '11110', '1111051500')
         * @param {object} [parentCodes={}] - 상위 행정구역 코드. 시군구/읍면동 조회 시 필요합니다. (예: { sidoCd: '11', sigunguCd: '11110' })
         * @returns {Promise<string>} - API 호출 성공 시 행정구역 명칭, 실패 시 빈 문자열을 담은 Promise 객체.
         */
        async function getCodeName(type, code, parentCodes = {}) {
            // 조회할 코드가 없으면 즉시 빈 문자열을 반환합니다.
            if (!code) return '';

            // 서버의 공통 코드 조회 API에 전달할 URL 파라미터를 생성합니다.
            const params = new URLSearchParams();
            if (type === 'sigungu' && parentCodes.sidoCd) {
                // 시군구 조회 시, 어떤 시도에 속한 시군구인지 구분하기 위해 시도 코드를 파라미터로 추가합니다.
                params.append('sidoCd', parentCodes.sidoCd);
            } else if (type === 'emd' && parentCodes.sidoCd && parentCodes.sigunguCd) {
                // 읍면동 조회 시, 시도 코드와 시군구 코드를 파라미터로 추가합니다.
                params.append('sidoCd', parentCodes.sidoCd);
                params.append('sigunguCd', parentCodes.sigunguCd);
            }

            // 최종적으로 호출할 API의 전체 URL을 조립합니다.
            const url = `${contextPath}/cmm/codes/${type}?${params.toString()}`;

            try {
                // fetch 함수를 사용해 서버에 GET 요청을 보냅니다. `await`는 응답이 올 때까지 기다립니다.
                const response = await fetch(url);
                // 응답받은 JSON 데이터를 JavaScript 객체로 변환합니다.
                const result = await response.json();

                // API 호출이 성공했고, 응답 데이터가 배열 형태인지 확인합니다.
                if (result.success && Array.isArray(result.data)) {
                    // 배열에서 전달받은 `code`와 일치하는 항목을 찾습니다.
                    const found = result.data.find(item => item.codeCd === code);
                    // 일치하는 항목을 찾았다면 그 항목의 이름(codeNm)을, 못 찾았다면 빈 문자열을 반환합니다.
                    return found ? found.codeNm : '';
                }
                // API 호출은 성공했지만 데이터가 없는 경우, 빈 문자열을 반환합니다.
                return '';
            } catch (error) {
                // 네트워크 오류 등 API 호출 중 예외가 발생하면 콘솔에 에러를 기록하고 빈 문자열을 반환합니다.
                console.error(`'${type}' 코드('${code}')의 명칭을 가져오는 데 실패했습니다:`, error);
                return '';
            }
        }

        /**
         * @public
         * @description 웹스퀘어 페이지에서 직접 호출할 수 있도록 `window` 객체에 등록하는 공용 함수입니다.
         *              전달받은 행정구역 코드를 기준으로 지도 위치를 이동시킵니다.
         * @param {string} sidoCd - 이동할 위치의 시도 코드 (필수)
         * @param {string} sigunguCd - 이동할 위치의 시군구 코드 (필수)
         * @param {string} [emdCd] - 이동할 위치의 읍면동 코드 (선택 사항)
         */
        window.moveMapByAddressCode = async function (sidoCd, sigunguCd, emdCd) {
            // 지도나 지오코더가 초기화되지 않았다면, 에러 메시지를 출력하고 함수를 중단합니다.
            if (!websquareMap || !geocoder) {
                console.error('[지도 오류] 지도가 아직 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.');
                return;
            }

            // 각 행정구역 코드에 해당하는 실제 명칭을 `getCodeName` 함수를 통해 비동기적으로 조회합니다.
            const sidoName = await getCodeName('sido', sidoCd);
            const sigunguName = await getCodeName('sigungu', sigunguCd, {sidoCd: sidoCd});
            const emdName = emdCd ? await getCodeName('emd', emdCd, {sidoCd: sidoCd, sigunguCd: sigunguCd}) : '';

            // 조회된 명칭을 조합하여 카카오맵 API가 인식할 수 있는 주소 문자열을 만들고,
            // 주소 레벨에 따라 적절한 지도 확대 레벨을 결정합니다.
            let address = '';
            let level = 9; // 기본(시도) 레벨
            if (sidoName && sigunguName && emdName) {
                // 읍면동까지 모든 정보가 있으면 가장 상세한 주소 생성
                address = `${sidoName} ${sigunguName} ${emdName}`;
                level = 5; // 읍면동 단위에 적합한 확대 레벨
            } else if (sidoName && sigunguName) {
                // 시군구까지만 정보가 있을 경우
                address = `${sidoName} ${sigunguName}`;
                level = 7; // 시군구 단위에 적합한 확대 레벨
            } else if (sidoName) {
                // 시도 정보만 있을 경우
                address = sidoName;
                level = 9; // 시도 단위에 적합한 확대 레벨
            } else {
                // 유효한 주소를 만들 수 없으면 경고를 출력하고 함수를 종료합니다.
                console.warn('[지도 경고] 지도 이동 실패: 유효한 행정구역 코드가 아닙니다.');
                return;
            }

            console.log(`[지도 이동] 검색할 주소: "${address}", 확대 레벨: ${level}`);

            // geocoder.addressSearch를 사용하여 주소 문자열로 좌표를 검색합니다.
            geocoder.addressSearch(address, function (result, status) {
                // `status`가 `kakao.maps.services.Status.OK`이면 검색에 성공한 것입니다.
                if (status === kakao.maps.services.Status.OK) {
                    // 검색 결과의 첫 번째 항목에서 좌표 정보를 가져와 `LatLng` 객체를 생성합니다.
                    const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                    // `setCenter` 함수로 지도의 중심을 검색된 좌표로 이동시킵니다.
                    websquareMap.setCenter(coords);
                    // `setLevel` 함수로 지도의 확대 레벨을 조절합니다.
                    websquareMap.setLevel(level);
                    console.log(`[지도 이동] 성공: '${address}' 위치로 이동했습니다.`);
                } else {
                    // 주소 검색에 실패한 경우 콘솔에 에러 메시지를 출력합니다.
                    console.error(`[지도 오류] '${address}' 주소의 좌표 검색에 실패했습니다. (상태: ${status})`);
                }
            });
        };

        // Kakao Maps SDK 스크립트가 완전히 로드되고 준비가 되면,
        // `kakao.maps.load`의 콜백 함수로 등록된 `initWebsquareMap` 함수를 실행합니다.
        // 이것이 이 스크립트의 시작점입니다.
        kakao.maps.load(initWebsquareMap);

    })();
</script>
