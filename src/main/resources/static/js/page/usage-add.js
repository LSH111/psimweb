/* usage-add.js — 주차이용실태 등록 폼 (이벤트 위임 방식) */

// 🔥 즉시 실행 함수로 감싸서 전역 오염 방지
(function() {
    'use strict';

    const $ = (s, ctx = document) => ctx.querySelector(s);
    const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
    const BASE_PATH = (typeof contextPath !== 'undefined' && contextPath) ? contextPath : '';
    const withBase = (url = '') => {
        if (!url) return BASE_PATH;
        return BASE_PATH + (url.startsWith('/') ? url : '/' + url);
    };

    // 🔥 여러 장의 사진 파일 저장
    let selectedPhotoFiles = [];

    // ========== 행정구역 코드 로드 ==========
    const FormCodeUtils = {
        async loadSidoList() {
            try {
                const result = await CodeApi.loadSidoList(contextPath);
                const sidoSelect = $('#f_sido');
                if (!sidoSelect) return;

                sidoSelect.innerHTML = '<option value="">선택</option>';
                if (result.success && result.data) {
                    result.data.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.codeCd;
                        option.textContent = item.codeNm;
                        sidoSelect.appendChild(option);
                    });
                }
            } catch (error) {
                console.error('시도 목록 로드 실패:', error);
            }
        },

        async loadSigunguList(sidoCd) {
            try {
                const sigunguSelect = $('#f_sigungu');
                const emdSelect = $('#f_emd');
                if (!sigunguSelect || !emdSelect) return;

                sigunguSelect.innerHTML = '<option value="">선택</option>';
                emdSelect.innerHTML = '<option value="">선택</option>';
                emdSelect.disabled = true;

                if (!sidoCd) {
                    sigunguSelect.disabled = true;
                    return;
                }

                const result = await CodeApi.loadSigunguList(sidoCd, contextPath);

                if (result.success && result.data) {
                    result.data.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.codeCd;
                        option.textContent = item.codeNm;
                        sigunguSelect.appendChild(option);
                    });
                    sigunguSelect.disabled = false;
                } else {
                    sigunguSelect.disabled = true;
                }
            } catch (error) {
                console.error('시군구 목록 로드 실패:', error);
                const sigunguSelect = $('#f_sigungu');
                if (sigunguSelect) sigunguSelect.disabled = true;
            }
        },

        async loadEmdList(sigunguCd) {
            try {
                const emdSelect = $('#f_emd');
                if (!emdSelect) return;

                emdSelect.innerHTML = '<option value="">선택</option>';

                if (!sigunguCd) {
                    emdSelect.disabled = true;
                    return;
                }

                const result = await CodeApi.loadEmdList(sigunguCd, contextPath);

                if (result.success && result.data) {
                    result.data.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.emdCd;
                        option.textContent = item.lgalEmdNm;
                        emdSelect.appendChild(option);
                    });
                    emdSelect.disabled = false;
                } else {
                    emdSelect.disabled = true;
                }
            } catch (error) {
                console.error('읍면동 목록 로드 실패:', error);
                const emdSelect = $('#f_emd');
                if (emdSelect) emdSelect.disabled = true;
            }
        }
    };

    // ========== 이벤트 위임 방식으로 전역 이벤트 리스너 등록 ==========
    function setupGlobalEventDelegation() {
        // 🔥 document 레벨에서 이벤트 위임 (버블링 활용)
        document.addEventListener('click', function(e) {
            const target = e.target;

            // 사진첩 버튼
            if (target.id === 'btnPickFromLibrary' || target.closest('#btnPickFromLibrary')) {
                e.preventDefault();
                const photoLibInput = $('#f_photo_lib');
                if (photoLibInput) photoLibInput.click();
            }

            // 카메라 버튼
            else if (target.id === 'btnTakePhoto' || target.closest('#btnTakePhoto')) {
                e.preventDefault();
                const photoCamInput = $('#f_photo_cam');
                if (photoCamInput) photoCamInput.click();
            }

            // 위치 버튼
            else if (target.id === 'btnUseGeolocation' || target.closest('#btnUseGeolocation')) {
                e.preventDefault();
                getGeolocation();
            }

            // 초기화 버튼
            else if (target.id === 'btnClearPhoto' || target.closest('#btnClearPhoto')) {
                e.preventDefault();
                clearPhoto();
            }

            // 주소찾기 버튼
            else if (target.id === 'btnFindAddr' || target.closest('#btnFindAddr')) {
                e.preventDefault();
                openPostcode();
            }

            // 저장 버튼 - 🔥 이 부분을 수정하세요
            else if (target.id === 'btnSave' || target.id === 'btnSaveTop' ||
                target.closest('#btnSave') || target.closest('#btnSaveTop')) {
                e.preventDefault();
                e.stopPropagation(); // 🔥 추가
                e.stopImmediatePropagation(); // 🔥 추가
                handleSave();
                return false; // 🔥 추가
            }

            // 우편번호 닫기 버튼
            else if (target.id === 'postcodeClose' || target.closest('#postcodeClose')) {
                const layer = $('#postcodeLayer');
                if (layer) layer.style.display = 'none';
            }
        });

        // 🔥 파일 input change 이벤트 (위임 불가능하므로 MutationObserver 사용)
        const observeFileInputs = () => {
            const photoLibInput = $('#f_photo_lib');
            const photoCamInput = $('#f_photo_cam');

            if (photoLibInput && !photoLibInput.dataset.listenerAttached) {
                photoLibInput.addEventListener('change', handlePhotoSelect);
                photoLibInput.dataset.listenerAttached = 'true';
            }

            if (photoCamInput && !photoCamInput.dataset.listenerAttached) {
                photoCamInput.addEventListener('change', handlePhotoSelect);
                photoCamInput.dataset.listenerAttached = 'true';
            }
        };

        // 🔥 MutationObserver로 DOM 변화 감지
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    const panelAdd = $('#panelAdd');
                    if (panelAdd && panelAdd.style.display !== 'none') {
                        observeFileInputs();
                    }
                }
            }
        });

        // panelAdd 감시 시작
        const panelAdd = $('#panelAdd');
        if (panelAdd) {
            observer.observe(panelAdd, {
                attributes: true,
                attributeFilter: ['style'],
                childList: true,
                subtree: true
            });
        }

        // 초기 체크
        observeFileInputs();

        // 🔥 행정구역 셀렉트 이벤트
        document.addEventListener('change', function(e) {
            const target = e.target;

            if (target.id === 'f_sido') {
                FormCodeUtils.loadSigunguList(target.value);
            } else if (target.id === 'f_sigungu') {
                FormCodeUtils.loadEmdList(target.value);
            } else if (target.id === 'f_emd') {
            }
        });
    }

    // ========== 폼 초기화 ==========
    async function initUsageAddForm() {

        // 행정구역 데이터 로드
        await FormCodeUtils.loadSidoList();

        // 🔥 세션에서 시도 코드가 있으면 자동 선택
        if (typeof sessionInfo !== 'undefined' && sessionInfo.sidoCd) {
            const sidoSelect = $('#f_sido');
            if (sidoSelect) {
                // 시도 코드로 옵션 찾기
                const sidoOptions = Array.from(sidoSelect.options);
                const matchingSido = sidoOptions.find(opt => opt.value === sessionInfo.sidoCd);

                if (matchingSido) {
                    sidoSelect.value = sessionInfo.sidoCd;

                    // 시군구 목록 로드
                    await FormCodeUtils.loadSigunguList(sessionInfo.sidoCd);

                    // 🔥 시군구도 자동 선택 및 readonly 처리
                    if (sessionInfo.sigunguCd) {
                        const sigunguSelect = $('#f_sigungu');
                        if (sigunguSelect) {
                            const sigunguOptions = Array.from(sigunguSelect.options);
                            const matchingSigungu = sigunguOptions.find(opt => opt.value === sessionInfo.sigunguCd);

                            if (matchingSigungu) {
                                sigunguSelect.value = sessionInfo.sigunguCd;

                                // 🔥 시군구 readonly 처리
                                sigunguSelect.disabled = true;
                                sigunguSelect.style.backgroundColor = '#f1f5f9';
                                sigunguSelect.style.cursor = 'not-allowed';

                                // 읍면동 목록 로드
                                await FormCodeUtils.loadEmdList(sessionInfo.sigunguCd);
                            }
                        }
                    }
                }
            }
        }

        // 🔥 조사원 정보 세션에서 자동 입력 (readonly 처리 포함)
        setupSurveyorInfo();

        // 🔥 차량번호 입력 검증 추가
        setupPlateNumberValidation();

        // 오늘 날짜 기본값 설정
        setTodayDate();

    }

    // 🔥 조사원 정보 설정 (readonly 처리)
    function setupSurveyorInfo() {
        if (typeof sessionInfo !== 'undefined') {
            const surveyorName = $('#f_surveyorName');
            const surveyorContact = $('#f_surveyorContact');

            if (surveyorName && sessionInfo.userNm) {
                surveyorName.value = sessionInfo.userNm;
                surveyorName.readOnly = true;
                surveyorName.style.backgroundColor = '#f1f5f9';
                surveyorName.style.cursor = 'not-allowed';
            }
            if (surveyorContact && sessionInfo.mbtlnum) {
                surveyorContact.value = sessionInfo.mbtlnum;
                surveyorContact.readOnly = true;
                surveyorContact.style.backgroundColor = '#f1f5f9';
                surveyorContact.style.cursor = 'not-allowed';
            }
        }
    }

    // 🔥 차량번호 형식 검증 추가
    function setupPlateNumberValidation() {
        const plateInput = $('#f_plateNumber');
        if (!plateInput) return;

        // 실시간 입력 검증
        plateInput.addEventListener('input', function(e) {
            let value = e.target.value;

            // 한글, 숫자만 허용 (공백 제거)
            value = value.replace(/[^가-힣0-9ㄱ-ㅎㅏ-ㅣ]/g, '');

            e.target.value = value;
        });

        // 포커스 아웃 시 최종 검증
        plateInput.addEventListener('blur', function(e) {
            const value = e.target.value.trim();

            if (value && !isValidPlateNumber(value)) {
                alert('⚠️ 올바른 차량번호 형식이 아닙니다.\n\n예시:\n- 12가3456\n- 서울12가3456\n- 123가4567\n- 경기12가3456');
                e.target.focus();
            }
        });

    }

    // 🔥 한국 차량번호 패턴 검증
    function isValidPlateNumber(plateNumber) {
        if (!plateNumber) return false;

        // 한국 차량번호 패턴들
        const patterns = [
            /^\d{2,3}[가-힣]{1}\d{4}$/,           // 12가3456, 123가4567
            /^[가-힣]{2}\d{2,3}[가-힣]{1}\d{4}$/  // 서울12가3456, 경기123가4567
        ];

        return patterns.some(pattern => pattern.test(plateNumber));
    }

    // 오늘 날짜 설정
    function setTodayDate() {
        const surveyDate = $('#f_surveyDate');
        if (surveyDate) {
            const today = new Date().toISOString().split('T')[0];
            surveyDate.value = today;
        }
    }

    // ========== 사진 선택 처리 ==========
    function handlePhotoSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        selectedPhotoFiles = [...selectedPhotoFiles, ...files];

        // 🔥 첫 번째 사진에서 GPS 정보 추출 시도
        if (files.length > 0 && files[0]) {
            extractGPSFromPhoto(files[0]);
        }

        displaySelectedFiles();
        displayPreviews();
    }

    // 🔥 사진에서 GPS 정보 추출
    function extractGPSFromPhoto(file) {

        // EXIF.js 라이브러리 확인
        if (typeof EXIF === 'undefined') {
            console.error('❌ EXIF.js 라이브러리가 로드되지 않았습니다.');
            return;
        }

        // FileReader로 파일 읽기
        const reader = new FileReader();

        reader.onload = function(e) {

            // 이미지 객체 생성
            const img = new Image();
            img.src = e.target.result;

            img.onload = function() {

                EXIF.getData(img, function() {

                    // 모든 EXIF 태그 출력 (디버깅용)
                    const allTags = EXIF.getAllTags(this);

                    const lat = EXIF.getTag(this, 'GPSLatitude');
                    const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
                    const lng = EXIF.getTag(this, 'GPSLongitude');
                    const lngRef = EXIF.getTag(this, 'GPSLongitudeRef');

                    if (lat && lng) {
                        const latitude = convertDMSToDD(lat, latRef);
                        const longitude = convertDMSToDD(lng, lngRef);

                        const latInput = $('#f_lat');
                        const lngInput = $('#f_lng');

                        if (latInput) {
                            latInput.value = latitude.toFixed(6);
                        }
                        if (lngInput) {
                            lngInput.value = longitude.toFixed(6);
                        }

                        alert(`📍 사진에서 위치 정보를 가져왔습니다.\\n위도: ${latitude.toFixed(6)}\\n경도: ${longitude.toFixed(6)}`);

                    } else {
                        console.warn('⚠️ 이 사진에는 GPS 정보가 없습니다.');
                        alert('⚠️ 이 사진에는 위치 정보가 없습니다.\\n\"기기 위치로 좌표\" 버튼을 사용하거나,\\n위치 정보가 있는 사진을 선택해주세요.');
                    }
                });
            };

            img.onerror = function() {
                console.error('❌ 이미지 로드 실패');
            };
        };

        reader.onerror = function() {
            console.error('❌ 파일 읽기 실패');
        };

        reader.readAsDataURL(file);
    }

// 🔥 DMS(도분초)를 DD(십진도) 형식으로 변환
    function convertDMSToDD(dms, ref) {
        if (!dms || dms.length !== 3) {
            console.error('❌ 잘못된 DMS 형식:', dms);
            return 0;
        }

        const degrees = dms[0];
        const minutes = dms[1];
        const seconds = dms[2];

        let dd = degrees + minutes / 60 + seconds / 3600;

        // 남위(S) 또는 서경(W)인 경우 음수로 변환
        if (ref === 'S' || ref === 'W') {
            dd = dd * -1;
        }

        return dd;
    }

    // 선택된 파일 목록 표시
    function displaySelectedFiles() {
        const filesList = $('#selected-files-list');
        const filesContainer = $('#files-container');
        const fileCount = $('#file-count');

        if (!filesList || !filesContainer) return;

        filesList.style.display = 'block';
        fileCount.textContent = selectedPhotoFiles.length;

        filesContainer.innerHTML = selectedPhotoFiles.map((file, index) => {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            return `
                <div style="display:flex; align-items:center; gap:12px; padding:10px; background:white; border-radius:6px; border:1px solid #e2e8f0;">
                    <span style="font-size:1.5rem;">📄</span>
                    <div style="flex:1;">
                        <div style="font-size:0.9rem; font-weight:600; color:#1e293b;">${file.name}</div>
                        <div style="font-size:0.8rem; color:#64748b;">${sizeMB} MB</div>
                    </div>
                    <button type="button" class="btn ghost" data-remove-index="${index}" style="padding:6px 12px; font-size:0.85rem;">삭제</button>
                </div>
            `;
        }).join('');

        // 🔥 삭제 버튼 이벤트 (동적 생성된 요소)
        filesContainer.querySelectorAll('[data-remove-index]').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.removeIndex);
                removePhotoFile(index);
            });
        });
    }

    // 파일 삭제
    function removePhotoFile(index) {
        selectedPhotoFiles.splice(index, 1);
        displaySelectedFiles();
        displayPreviews();

        if (selectedPhotoFiles.length === 0) {
            const filesList = $('#selected-files-list');
            const previewContainer = $('#preview-container');
            if (filesList) filesList.style.display = 'none';
            if (previewContainer) previewContainer.style.display = 'none';
        }
    }

    // 미리보기 표시
    function displayPreviews() {
        const previewContainer = $('#preview-container');
        const previewGrid = $('#preview-grid');

        if (!previewContainer || !previewGrid) return;

        if (selectedPhotoFiles.length === 0) {
            previewContainer.style.display = 'none';
            return;
        }

        previewContainer.style.display = 'block';
        previewGrid.innerHTML = '';

        selectedPhotoFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgWrapper = document.createElement('div');
                imgWrapper.style.cssText = 'position:relative; border-radius:8px; overflow:hidden; border:2px solid #e2e8f0;';

                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.cssText = 'width:100%; height:150px; object-fit:cover;';

                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.textContent = '×';
                deleteBtn.dataset.removePreviewIndex = index;
                deleteBtn.style.cssText = 'position:absolute; top:8px; right:8px; width:28px; height:28px; background:rgba(0,0,0,0.6); color:white; border:none; border-radius:50%; cursor:pointer; font-size:1.2rem; display:flex; align-items:center; justify-content:center;';
                deleteBtn.onclick = () => removePhotoFile(index);

                imgWrapper.appendChild(img);
                imgWrapper.appendChild(deleteBtn);
                previewGrid.appendChild(imgWrapper);
            };
            reader.readAsDataURL(file);
        });
    }

    // ========== 위치 정보 가져오기 ==========
    function getGeolocation() {

        if (!navigator.geolocation) {
            alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);

                const latInput = $('#f_lat');
                const lngInput = $('#f_lng');

                if (latInput) latInput.value = lat;
                if (lngInput) lngInput.value = lng;

                alert(`위치 정보를 가져왔습니다.\n위도: ${lat}\n경도: ${lng}`);
            },
            (error) => {
                console.error('위치 정보 가져오기 실패:', error);
                alert('위치 정보를 가져올 수 없습니다.\n브라우저 설정에서 위치 권한을 확인해주세요.');
            }
        );
    }

    // ========== 사진 초기화 ==========
    function clearPhoto() {
        selectedPhotoFiles = [];

        const photoLibInput = $('#f_photo_lib');
        const photoCamInput = $('#f_photo_cam');
        const filesList = $('#selected-files-list');
        const previewContainer = $('#preview-container');

        if (photoLibInput) photoLibInput.value = '';
        if (photoCamInput) photoCamInput.value = '';
        if (filesList) filesList.style.display = 'none';
        if (previewContainer) previewContainer.style.display = 'none';

    }


    // 🔥 저장 중 플래그 추가
    let isSaving = false;

    // ========== 저장 처리 ==========
    async function handleSave() {
        // 🔥 이미 저장 중이면 중복 실행 방지
        if (isSaving) {
            console.warn('⚠️ 이미 저장 중입니다.');
            return;
        }


        // 🔥 저장 시작 플래그 설정
        isSaving = true;

        // 🔥 버튼 비활성화
        const saveButtons = document.querySelectorAll('#btnSave, #btnSaveTop');
        saveButtons.forEach(btn => {
            btn.disabled = true;
            btn.textContent = '저장 중...';
        });

        // 🔥 validation 실패 시 복구하는 함수
        const resetSaveState = () => {
            isSaving = false;
            saveButtons.forEach(btn => {
                btn.disabled = false;
                btn.textContent = '💾 저장하기';
            });
        };

        const data = {
            emdCd: $('#f_emd')?.value || '',
            examinDd: $('#f_surveyDate')?.value || '',
            examinTimelge: getTimeRange(),
            vhctyCd: document.querySelector('input[name="vehicleType"]:checked')?.value || '',
            lawGbn: document.querySelector('input[name="lawGbn"]:checked')?.value || '1',
            lawCd: document.querySelector('input[name="lawGbn"]:checked')?.value || '1',
            vhcleNo: $('#f_plateNumber')?.value?.trim() || '',
            srvyId: $('#f_surveyorName')?.value || '',
            srvyTel: $('#f_surveyorContact')?.value || '',
            remark: $('#f_remarks')?.value || '',
            plceLat: $('#f_lat')?.value || '',
            plceLon: $('#f_lng')?.value || ''
        };

        // 🔥 필수 입력 검증 - 실패 시 상태 복구
        if (!data.emdCd) {
            alert('읍면동을 선택해주세요.');
            resetSaveState();
            return;
        }
        if (!data.examinDd) {
            alert('조사일을 입력해주세요.');
            resetSaveState();
            return;
        }

        // 🔥 차량번호 검증
        if (!data.vhcleNo) {
            alert('차량번호를 입력해주세요.');
            resetSaveState();
            return;
        }
        if (!isValidPlateNumber(data.vhcleNo)) {
            alert('⚠️ 올바른 차량번호 형식이 아닙니다.\n\n예시:\n- 12가3456\n- 서울12가3456\n- 123가4567\n- 경기12가3456');
            $('#f_plateNumber')?.focus();
            resetSaveState();
            return;
        }

        if (!data.srvyId) {
            alert('조사원 성명을 입력해주세요.');
            resetSaveState();
            return;
        }

        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });

            selectedPhotoFiles.forEach((file, index) => {
                formData.append('photos', file);
            });

            const response = await fetch(withBase(`/prk/api/usage-status/save`), {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert('저장되었습니다.');
                resetUsageAddForm();
                clearPhoto();

                // 🔥 등록 탭 닫기
                const tabAdd = document.querySelector('[data-tab="add"]');
                if (tabAdd) {
                    tabAdd.classList.remove('active');
                }

                // 🔥 등록 패널 숨기기
                const panelAdd = document.querySelector('#panelAdd');
                if (panelAdd) {
                    panelAdd.style.display = 'none';
                }

                // 🔥 목록 탭 활성화
                const tabList = document.querySelector('[data-tab="list"]');
                if (tabList) {
                    tabList.classList.add('active');
                }

                // 🔥 목록 패널 표시
                const panelList = document.querySelector('#panelList');
                if (panelList) {
                    panelList.style.display = 'block';
                }

                // 🔥 목록 새로고침 (딜레이 추가)
                setTimeout(() => {
                    if (typeof window.loadUsageStatusList === 'function') {
                        window.loadUsageStatusList();
                    } else {
                        console.warn('⚠️ loadUsageStatusList 함수가 없습니다.');
                    }
                }, 300);

            } else {
                alert('저장 실패: ' + (result.message || '알 수 없는 오류'));
            }
        } catch (error) {
            console.error('❌ 저장 오류:', error);
            alert('저장 중 오류가 발생했습니다: ' + error.message);
        } finally {
            // 🔥 저장 완료 후 플래그 해제 및 버튼 활성화
            resetSaveState();
        }
    }

    function getTimeRange() {
        const startHour = $('#f_startHour')?.value || '';
        const startMin = $('#f_startMin')?.value || '';
        const endHour = $('#f_endHour')?.value || '';
        const endMin = $('#f_endMin')?.value || '';

        if (startHour && startMin && endHour && endMin) {
            // DB 컬럼 길이(varchar(11))에 맞춰 공백 없이 저장: HH:MM-HH:MM (11자 이하)
            return `${startHour.padStart(2, '0')}:${startMin.padStart(2, '0')}-${endHour.padStart(2, '0')}:${endMin.padStart(2, '0')}`;
        }
        return '';
    }

    // ========== 폼 리셋 ==========
    function resetUsageAddForm() {
        const inputs = $$('input[type="text"], input[type="number"], input[type="date"], textarea');
        inputs.forEach(input => {
            if (input.id !== 'f_surveyorName' && input.id !== 'f_surveyorContact' && input.id !== 'f_lat' && input.id !== 'f_lng') {
                input.value = '';
            }
        });

        const selects = $$('select');
        selects.forEach(select => {
            select.selectedIndex = 0;
        });

        const firstVehicleType = document.querySelector('input[name="vehicleType"]');
        if (firstVehicleType) firstVehicleType.checked = true;

        const firstLawGbn = document.querySelector('input[name="lawGbn"]');
        if (firstLawGbn) firstLawGbn.checked = true;

        setTodayDate();
        clearPhoto();
    }

    // ========== 우편번호 검색 ==========
    function openPostcode() {
        const layer = $('#postcodeLayer');
        const container = $('#postcodeContainer');
        if (!layer || !container) return;
        if (!window.daum || !window.daum.Postcode) {
            toast && toast('주소 검색 스크립트가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        layer.style.display = 'block';

        const postcode = new daum.Postcode({
            oncomplete: async function(data) {

                try {
                    // 🔥 1단계: 시도 선택
                    const sido = $('#f_sido');
                    if (sido) {
                        const sidoText = data.sido;

                        const sidoOption = Array.from(sido.options).find(opt =>
                            opt.textContent.trim() === sidoText.trim()
                        );

                        if (sidoOption) {
                            sido.value = sidoOption.value;
                            sido.dispatchEvent(new Event('change'));

                            // 🔥 2단계: 시군구 목록 로드 대기
                            await FormCodeUtils.loadSigunguList(sidoOption.value);

                            // 🔥 3단계: 시군구 선택
                            const sigungu = $('#f_sigungu');
                            if (sigungu) {
                                const sigunguText = data.sigungu;

                                const sigunguOption = Array.from(sigungu.options).find(opt =>
                                    opt.textContent.trim() === sigunguText.trim()
                                );

                                if (sigunguOption) {
                                    sigungu.value = sigunguOption.value;
                                    sigungu.dispatchEvent(new Event('change'));

                                    // 🔥 4단계: 읍면동 목록 로드 대기
                                    await FormCodeUtils.loadEmdList(sigunguOption.value);

                                    // 🔥 5단계: 읍면동 선택
                                    const emd = $('#f_emd');
                                    if (emd) {
                                        const emdText = data.bname; // bname = 법정동명

                                        // 🔥 다양한 매칭 시도
                                        let emdOption = null;

                                        // 방법 1: 정확히 일치
                                        emdOption = Array.from(emd.options).find(opt =>
                                            opt.textContent.trim() === emdText.trim()
                                        );

                                        // 방법 2: 읍/면/동 제거하고 비교
                                        if (!emdOption) {
                                            const emdTextClean = emdText.replace(/[읍면동]/g, '').trim();

                                            emdOption = Array.from(emd.options).find(opt => {
                                                const optTextClean = opt.textContent.replace(/[읍면동]/g, '').trim();
                                                return optTextClean === emdTextClean;
                                            });
                                        }

                                        // 방법 3: 부분 포함 검색 (양방향)
                                        if (!emdOption) {
                                            emdOption = Array.from(emd.options).find(opt => {
                                                const optText = opt.textContent.trim();
                                                const searchText = emdText.trim();

                                                // "선택" 옵션은 제외
                                                if (optText === '선택' || optText === '') return false;

                                                return optText.includes(searchText) || searchText.includes(optText);
                                            });
                                        }

                                        if (emdOption) {
                                            emd.value = emdOption.value;
                                            emd.dispatchEvent(new Event('change'));
                                        } else {
                                            console.error('❌ 읍면동을 찾을 수 없음:', emdText);
                                            console.warn('💡 DB에 해당 읍면동 데이터가 없을 수 있습니다.');
                                            alert(`⚠️ "${emdText}" 읍면동을 찾을 수 없습니다.\n수동으로 선택해주세요.`);
                                        }
                                    }
                                } else {
                                    console.error('❌ 시군구를 찾을 수 없음:', sigunguText);
                                }
                            }
                        } else {
                            console.error('❌ 시도를 찾을 수 없음:', sidoText);
                        }
                    }

                    // 🔥 6단계: 리(里) 파싱
                    const ri = $('#f_ri');
                    if (ri && data.bname2) {
                        ri.value = data.bname2;
                    }

                    // 🔥 7단계: 산 여부 파싱
                    if (data.jibunAddress) {
                        const isMountain = data.jibunAddress.includes('산');
                        const mountainRadio = document.querySelector(`input[name="mountainYn"][value="${isMountain ? 'Y' : 'N'}"]`);
                        if (mountainRadio) {
                            mountainRadio.checked = true;
                        }
                    }

                    // 🔥 8단계: 본번/부번 파싱
                    if (data.bname1) {
                        const parts = data.bname1.split('-');
                        const mainNum = $('#f_mainNum');
                        const subNum = $('#f_subNum');

                        if (mainNum && parts[0]) {
                            mainNum.value = parts[0].replace(/\D/g, ''); // 숫자만 추출
                        }
                        if (subNum && parts[1]) {
                            subNum.value = parts[1].replace(/\D/g, '');
                        }
                    }

                    // 🔥 9단계: 건물명
                    const buildingName = $('#f_buildingName');
                    if (buildingName && data.buildingName) {
                        buildingName.value = data.buildingName;
                    }

                    // 🔥 10단계: 주소 표시
                    const addrJibun = $('#f_addr_jibun');
                    const addrRoad = $('#f_addr_road');

                    if (addrJibun) {
                        addrJibun.value = data.jibunAddress || data.autoJibunAddress || '';
                    }
                    if (addrRoad) {
                        addrRoad.value = data.roadAddress || data.autoRoadAddress || '';
                    }

                    // 🔥 11단계: 우편번호 (hidden)
                    const zip = $('#f_zip');
                    if (zip && data.zonecode) {
                        zip.value = data.zonecode;
                    }


                } catch (error) {
                    console.error('❌ 주소 파싱 중 오류:', error);
                    alert('주소 정보를 처리하는 중 오류가 발생했습니다.');
                }

                layer.style.display = 'none';
            },
            onclose: function() {
                layer.style.display = 'none';
            },
            width: '100%',
            height: '100%'
        });

        // 레이어에 직접 임베드해 항상 같은 영역에서 표시
        postcode.embed(container, {autoClose: false});
    }

    // ========== 전역 노출 ==========
    window.initUsageAddForm = initUsageAddForm;
    window.resetUsageAddForm = resetUsageAddForm;

    // ========== 초기화 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupGlobalEventDelegation);
    } else {
        setupGlobalEventDelegation();
    }

})();
