/* usage-add.js — 주차이용실태 등록 폼 (이벤트 위임 방식) */

// 🔥 즉시 실행 함수로 감싸서 전역 오염 방지
(function() {
    'use strict';

    const $ = (s, ctx = document) => ctx.querySelector(s);
    const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

    // 🔥 여러 장의 사진 파일 저장
    let selectedPhotoFiles = [];

    // ========== 행정구역 코드 로드 ==========
    const FormCodeUtils = {
        async loadSidoList() {
            try {
                const response = await fetch(`${contextPath}/cmm/codes/sido`);
                const result = await response.json();
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

                const response = await fetch(`${contextPath}/cmm/codes/sigungu?sidoCd=${sidoCd}`);
                const result = await response.json();

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

                const response = await fetch(`${contextPath}/cmm/codes/emd?sigunguCd=${sigunguCd}`);
                const result = await response.json();

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
                console.log('📁 사진첩 버튼 클릭 (이벤트 위임)');
                const photoLibInput = $('#f_photo_lib');
                if (photoLibInput) photoLibInput.click();
            }

            // 카메라 버튼
            else if (target.id === 'btnTakePhoto' || target.closest('#btnTakePhoto')) {
                e.preventDefault();
                console.log('📷 카메라 버튼 클릭 (이벤트 위임)');
                const photoCamInput = $('#f_photo_cam');
                if (photoCamInput) photoCamInput.click();
            }

            // 위치 버튼
            else if (target.id === 'btnUseGeolocation' || target.closest('#btnUseGeolocation')) {
                e.preventDefault();
                console.log('📍 위치 버튼 클릭 (이벤트 위임)');
                getGeolocation();
            }

            // 초기화 버튼
            else if (target.id === 'btnClearPhoto' || target.closest('#btnClearPhoto')) {
                e.preventDefault();
                console.log('🗑️ 초기화 버튼 클릭 (이벤트 위임)');
                clearPhoto();
            }

            // 주소찾기 버튼
            else if (target.id === 'btnFindAddr' || target.closest('#btnFindAddr')) {
                e.preventDefault();
                console.log('🔍 주소찾기 버튼 클릭 (이벤트 위임)');
                openPostcode();
            }

            // 저장 버튼
            else if (target.id === 'btnSave' || target.id === 'btnSaveTop' ||
                target.closest('#btnSave') || target.closest('#btnSaveTop')) {
                e.preventDefault();
                console.log('💾 저장 버튼 클릭 (이벤트 위임)');
                handleSave();
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
                console.log('✅ 사진첩 input 이벤트 등록');
            }

            if (photoCamInput && !photoCamInput.dataset.listenerAttached) {
                photoCamInput.addEventListener('change', handlePhotoSelect);
                photoCamInput.dataset.listenerAttached = 'true';
                console.log('✅ 카메라 input 이벤트 등록');
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
                console.log('시도 변경:', target.value);
                FormCodeUtils.loadSigunguList(target.value);
            } else if (target.id === 'f_sigungu') {
                console.log('시군구 변경:', target.value);
                FormCodeUtils.loadEmdList(target.value);
            } else if (target.id === 'f_emd') {
                console.log('✅ 읍면동 선택됨:', target.value, target.options[target.selectedIndex].text);
            }
        });
    }

    // ========== 폼 초기화 ==========
    async function initUsageAddForm() {
        console.log('📝 등록 폼 초기화');

        // 행정구역 데이터 로드
        await FormCodeUtils.loadSidoList();

        // 조사원 정보 세션에서 자동 입력
        setupSurveyorInfo();

        // 오늘 날짜 기본값 설정
        setTodayDate();

        console.log('✅ 폼 초기화 완료');
    }

    // 조사원 정보 설정
    function setupSurveyorInfo() {
        if (typeof sessionInfo !== 'undefined') {
            const surveyorName = $('#f_surveyorName');
            const surveyorContact = $('#f_surveyorContact');

            if (surveyorName && sessionInfo.userNm) {
                surveyorName.value = sessionInfo.userNm;
            }
            if (surveyorContact && sessionInfo.mbtlnum) {
                surveyorContact.value = sessionInfo.mbtlnum;
            }
        }
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

        console.log('선택된 파일 수:', files.length);
        selectedPhotoFiles = [...selectedPhotoFiles, ...files];
        displaySelectedFiles();
        displayPreviews();
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
        console.log('위치 정보 요청 시작');

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

        console.log('사진 초기화 완료');
    }

    // ========== 저장 처리 ==========
    async function handleSave() {
        console.log('💾 저장 시작');

        const data = {
            emdCd: $('#f_emd')?.value || '',
            examinDd: $('#f_surveyDate')?.value || '',
            examinTimelge: getTimeRange(),
            vhctyCd: document.querySelector('input[name="vehicleType"]:checked')?.value || '',
            lawGbn: document.querySelector('input[name="lawGbn"]:checked')?.value || '1',
            lawCd: document.querySelector('input[name="lawGbn"]:checked')?.value || '1',
            vhcleNo: $('#f_plateNumber')?.value || '',
            srvyId: $('#f_surveyorName')?.value || '',
            srvyTel: $('#f_surveyorContact')?.value || '',
            remark: $('#f_remarks')?.value || '',
            plceLat: $('#f_lat')?.value || '',
            plceLon: $('#f_lng')?.value || ''
        };

        if (!data.emdCd) {
            alert('읍면동을 선택해주세요.');
            return;
        }
        if (!data.examinDd) {
            alert('조사일을 입력해주세요.');
            return;
        }
        if (!data.vhcleNo) {
            alert('차량번호를 입력해주세요.');
            return;
        }
        if (!data.srvyId) {
            alert('조사원 성명을 입력해주세요.');
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

            const response = await fetch(`${contextPath}/prk/api/usage-status/save`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert('저장되었습니다.');
                resetUsageAddForm();
                clearPhoto();

                if (typeof window.switchToListTab === 'function') {
                    window.switchToListTab();
                }
                if (typeof window.loadUsageStatusList === 'function') {
                    window.loadUsageStatusList();
                }
            } else {
                alert('저장 실패: ' + (result.message || '알 수 없는 오류'));
            }
        } catch (error) {
            console.error('❌ 저장 오류:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    }

    function getTimeRange() {
        const startHour = $('#f_startHour')?.value || '';
        const startMin = $('#f_startMin')?.value || '';
        const endHour = $('#f_endHour')?.value || '';
        const endMin = $('#f_endMin')?.value || '';

        if (startHour && startMin && endHour && endMin) {
            return `${startHour.padStart(2, '0')}:${startMin.padStart(2, '0')} ~ ${endHour.padStart(2, '0')}:${endMin.padStart(2, '0')}`;
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
        if (!layer) return;

        layer.style.display = 'block';

        new daum.Postcode({
            oncomplete: function(data) {
                const sido = $('#f_sido');
                if (sido) {
                    const sidoText = data.sido;
                    const sidoOption = Array.from(sido.options).find(opt => opt.textContent === sidoText);
                    if (sidoOption) {
                        sido.value = sidoOption.value;
                        sido.dispatchEvent(new Event('change'));
                    }
                }

                setTimeout(async () => {
                    const sigungu = $('#f_sigungu');
                    if (sigungu) {
                        const sigunguText = data.sigungu;
                        const sigunguOption = Array.from(sigungu.options).find(opt => opt.textContent === sigunguText);
                        if (sigunguOption) {
                            sigungu.value = sigunguOption.value;
                            sigungu.dispatchEvent(new Event('change'));
                        }
                    }

                    setTimeout(() => {
                        const emd = $('#f_emd');
                        if (emd) {
                            const emdText = data.bname;
                            const emdOption = Array.from(emd.options).find(opt => opt.textContent === emdText);
                            if (emdOption) {
                                emd.value = emdOption.value;
                                emd.dispatchEvent(new Event('change'));
                            }
                        }
                    }, 500);
                }, 500);

                layer.style.display = 'none';
            },
            width: '100%',
            height: '100%'
        }).embed($('#postcodeContainer'));
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

    console.log('✅ usage-add.js 로드 완료 (이벤트 위임 방식)');
})();