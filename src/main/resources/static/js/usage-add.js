/* usage-add.js — 주차이용실태 등록 폼 */

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// 사진 파일 저장 변수
let selectedPhotoFile = null;

// ========== 행정구역 코드 로드 ==========
const FormCodeUtils = {
    // 시도 목록 로드 (등록 폼용)
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

    // 시군구 목록 로드 (등록 폼용)
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

    // 읍면동 목록 로드 (등록 폼용)
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

            console.log('📍 읍면동 목록 응답:', result);

            if (result.success && result.data) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.emdCd;
                    option.textContent = item.lgalEmdNm;
                    emdSelect.appendChild(option);
                    console.log(`추가된 옵션: ${item.emdCd} - ${item.lgalEmdNm}`);
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

// ========== 폼 초기화 ==========
window.initUsageAddForm = async function() {
    console.log('📝 등록 폼 초기화');

    // 행정구역 데이터 로드
    await FormCodeUtils.loadSidoList();

    // 행정구역 이벤트 리스너
    const sidoSelect = $('#f_sido');
    const sigunguSelect = $('#f_sigungu');
    const emdSelect = $('#f_emd');

    if (sidoSelect) {
        const newSidoSelect = sidoSelect.cloneNode(true);
        sidoSelect.parentNode.replaceChild(newSidoSelect, sidoSelect);

        newSidoSelect.addEventListener('change', async (e) => {
            console.log('시도 변경:', e.target.value);
            await FormCodeUtils.loadSigunguList(e.target.value);
        });
    }

    if (sigunguSelect) {
        const newSigunguSelect = sigunguSelect.cloneNode(true);
        sigunguSelect.parentNode.replaceChild(newSigunguSelect, sigunguSelect);

        newSigunguSelect.addEventListener('change', async (e) => {
            console.log('시군구 변경:', e.target.value);
            await FormCodeUtils.loadEmdList(e.target.value);
        });
    }

    if (emdSelect) {
        const newEmdSelect = emdSelect.cloneNode(true);
        emdSelect.parentNode.replaceChild(newEmdSelect, emdSelect);

        newEmdSelect.addEventListener('change', (e) => {
            console.log('✅ 읍면동 선택됨:', e.target.value, e.target.options[e.target.selectedIndex].text);
        });
    }

    // 🔥 사진 업로드 버튼 이벤트
    const btnPickFromLibrary = $('#btnPickFromLibrary');
    const btnTakePhoto = $('#btnTakePhoto');
    const btnUseGeolocation = $('#btnUseGeolocation');
    const btnClearPhoto = $('#btnClearPhoto');
    const photoLibInput = $('#f_photo_lib');
    const photoCamInput = $('#f_photo_cam');

    if (btnPickFromLibrary && photoLibInput) {
        btnPickFromLibrary.addEventListener('click', () => photoLibInput.click());
    }

    if (btnTakePhoto && photoCamInput) {
        btnTakePhoto.addEventListener('click', () => photoCamInput.click());
    }

    if (photoLibInput) {
        photoLibInput.addEventListener('change', handlePhotoSelect);
    }

    if (photoCamInput) {
        photoCamInput.addEventListener('change', handlePhotoSelect);
    }

    if (btnUseGeolocation) {
        btnUseGeolocation.addEventListener('click', getGeolocation);
    }

    if (btnClearPhoto) {
        btnClearPhoto.addEventListener('click', clearPhoto);
    }

    // 조사원 정보 세션에서 자동 입력
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

    // 오늘 날짜 기본값 설정
    const surveyDate = $('#f_surveyDate');
    if (surveyDate) {
        const today = new Date().toISOString().split('T')[0];
        surveyDate.value = today;
    }

    // 저장 버튼 이벤트
    const btnSave = $('#btnSave');
    const btnSaveTop = $('#btnSaveTop');

    if (btnSave) {
        btnSave.addEventListener('click', handleSave);
    }
    if (btnSaveTop) {
        btnSaveTop.addEventListener('click', handleSave);
    }

    // 주소찾기 버튼
    const btnFindAddr = $('#btnFindAddr');
    if (btnFindAddr) {
        btnFindAddr.addEventListener('click', openPostcode);
    }
};

// ========== 사진 선택 처리 ==========
function handlePhotoSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('선택된 파일:', file.name, file.size);

    selectedPhotoFile = file;

    // 미리보기 표시
    const preview = $('#preview');
    if (preview) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // EXIF 데이터에서 GPS 정보 추출 (선택사항)
    extractExifGPS(file);

    // 업로드 진행률 표시 (시뮬레이션)
    simulateUpload(file);
}

// ========== EXIF GPS 정보 추출 (선택사항) ==========
function extractExifGPS(file) {
    // EXIF 라이브러리가 있다면 GPS 정보 추출
    // 여기서는 단순 예시
    console.log('EXIF GPS 정보 추출 (미구현)');
}

// ========== 업로드 진행률 시뮬레이션 ==========
function simulateUpload(file) {
    const progressArea = $('#upload-progress-area');
    const progressFill = $('#progress-fill');
    const progressText = $('#progress-text');
    const fileName = $('#file-name');
    const fileSize = $('#file-size');
    const fileStatus = $('#file-status');
    const fileItem = $('#upload-file-item');
    const fileProgressFill = $('#file-progress-fill');
    const btnComplete = $('#btn-upload-complete');

    if (!progressArea) return;

    // 표시
    progressArea.style.display = 'block';
    fileItem.style.display = 'block';

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    fileName.textContent = file.name;
    fileSize.textContent = `0MB / ${fileSizeMB}MB`;
    fileStatus.textContent = '전송중';

    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progress > 100) progress = 100;

        progressFill.style.width = progress + '%';
        progressText.textContent = progress + '%';
        fileProgressFill.style.width = progress + '%';
        fileSize.textContent = `${(fileSizeMB * progress / 100).toFixed(2)}MB / ${fileSizeMB}MB`;

        if (progress >= 100) {
            clearInterval(interval);
            fileStatus.textContent = '완료';
            fileStatus.style.color = '#10b981';
            btnComplete.style.display = 'block';
        }
    }, 100);
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
            alert('위치 정보를 가져올 수 없습니다.');
        }
    );
}

// ========== 사진 초기화 ==========
function clearPhoto() {
    selectedPhotoFile = null;

    const preview = $('#preview');
    const photoLibInput = $('#f_photo_lib');
    const photoCamInput = $('#f_photo_cam');
    const progressArea = $('#upload-progress-area');

    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }

    if (photoLibInput) photoLibInput.value = '';
    if (photoCamInput) photoCamInput.value = '';
    if (progressArea) progressArea.style.display = 'none';

    console.log('사진 초기화 완료');
}

// ========== 저장 처리 ==========
async function handleSave() {
    console.log('💾 저장 시작');

    // 폼 데이터 수집
    const data = {
        emdCd: $('#f_emd')?.value || '',
        examinDd: $('#f_surveyDate')?.value || '',
        examinTimelge: getTimeRange(),
        vhctyCd: document.querySelector('input[name="vehicleType"]:checked')?.value || '',
        lawGbn: document.querySelector('input[name="lawGbn"]:checked')?.value || '1',
        vhcleNo: $('#f_plateNumber')?.value || '',
        srvyId: $('#f_surveyorName')?.value || '',
        srvyTel: $('#f_surveyorContact')?.value || '',
        remark: $('#f_remarks')?.value || '',
        // 🔥 위도/경도 추가
        plceLat: $('#f_lat')?.value || '',
        plceLon: $('#f_lng')?.value || ''
    };

    console.log('📤 전송 데이터:', data);
    console.log('📸 첨부 파일:', selectedPhotoFile);

    // 필수 값 검증
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
        // FormData로 변환 (파일 업로드 포함)
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });

        if (selectedPhotoFile) {
            formData.append('photo', selectedPhotoFile);
        }

        const response = await fetch(`${contextPath}/prk/api/usage-status/save`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        console.log('📥 서버 응답:', result);

        if (result.success) {
            alert('저장되었습니다.');
            window.resetUsageAddForm();
            clearPhoto();

            if (typeof switchToListTab === 'function') {
                switchToListTab();
            }
            if (typeof loadUsageStatusList === 'function') {
                loadUsageStatusList();
            }
        } else {
            alert('저장 실패: ' + (result.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('❌ 저장 오류:', error);
        alert('저장 중 오류가 발생했습니다.');
    }
}

// 시간 범위 문자열 생성 (HH:MM ~ HH:MM)
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
window.resetUsageAddForm = function() {
    console.log('🔄 폼 리셋');

    // 입력 필드 초기화
    const inputs = $$('input[type="text"], input[type="number"], input[type="date"], textarea');
    inputs.forEach(input => {
        if (input.id !== 'f_surveyorName' && input.id !== 'f_surveyorContact') {
            input.value = '';
        }
    });

    // 셀렉트 박스 초기화
    const selects = $$('select');
    selects.forEach(select => {
        select.selectedIndex = 0;
    });

    // 라디오 버튼 초기화
    const firstVehicleType = document.querySelector('input[name="vehicleType"]');
    if (firstVehicleType) firstVehicleType.checked = true;

    const firstLawGbn = document.querySelector('input[name="lawGbn"]');
    if (firstLawGbn) firstLawGbn.checked = true;

    // 오늘 날짜 다시 설정
    const surveyDate = $('#f_surveyDate');
    if (surveyDate) {
        const today = new Date().toISOString().split('T')[0];
        surveyDate.value = today;
    }

    // 사진 초기화
    clearPhoto();
};

// ========== 우편번호 검색 ==========
function openPostcode() {
    const layer = document.getElementById('postcodeLayer');
    if (!layer) return;

    layer.style.display = 'block';

    new daum.Postcode({
        oncomplete: function(data) {
            console.log('주소 검색 결과:', data);

            // 시/도
            const sido = $('#f_sido');
            if (sido) {
                const sidoText = data.sido;
                const sidoOption = Array.from(sido.options).find(opt => opt.textContent === sidoText);
                if (sidoOption) {
                    sido.value = sidoOption.value;
                    sido.dispatchEvent(new Event('change'));
                }
            }

            // 시/군/구
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

                // 읍/면/동
                setTimeout(() => {
                    const emd = $('#f_emd');
                    if (emd) {
                        const emdText = data.bname;
                        console.log('🔍 검색할 읍면동명:', emdText);
                        const emdOption = Array.from(emd.options).find(opt => opt.textContent === emdText);
                        if (emdOption) {
                            console.log('✅ 읍면동 매칭 성공:', emdOption.value, emdOption.textContent);
                            emd.value = emdOption.value;
                            emd.dispatchEvent(new Event('change'));
                        } else {
                            console.warn('⚠️ 읍면동 매칭 실패:', emdText);
                        }
                    }
                }, 500);
            }, 500);

            layer.style.display = 'none';
        },
        width: '100%',
        height: '100%'
    }).embed(document.getElementById('postcodeContainer'));

    // 닫기 버튼
    const closeBtn = document.getElementById('postcodeClose');
    if (closeBtn) {
        closeBtn.onclick = function() {
            layer.style.display = 'none';
        };
    }
}

// ========== 초기 로드 ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 usage-add.js 로드 완료');
});