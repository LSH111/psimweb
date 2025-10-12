<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <title>노상주차장</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/offparking.css"/>
</head>
<body>
<main class="main container">
    <div class="card">
        <div class="wrap">
            <header class="card head">
                <div class="title" id="v_name">노상주차장 상세</div>
                <span class="badge">노상</span>
                <span class="muted mono" id="v_id">관리번호</span>
                <span class="muted" id="v_addr"></span>
                <span class="actions" style="margin-left:auto">
            <button class="btn" id="btnPrint">인쇄</button>
            <button class="btn" id="btnSaveTop">저장</button>
          </span>
            </header>

            <section class="row">
                <!-- 기본정보 -->
                <div class="card">
                    <h2>기본정보</h2>
                    <div class="grid">
                        <div><label for="f_id">주차장관리번호</label><div class="ctl"><input id="f_id" class="mono" type="text" readonly /></div></div>
                        <div><label for="f_name">주차장명</label><div class="ctl"><input id="f_name" type="text" placeholder="예) 연남로 노상" /></div></div>
                        <div><label for="f_status">진행상태</label><div class="ctl"><input id="f_status" type="text" placeholder="예) PENDING/APPROVED" /></div></div>
                        <div><label for="f_type">주차장구분</label><div class="ctl"><input id="f_type" type="text" value="노상" readonly /></div></div>
                        <div><label for="f_sido">시도</label><div class="ctl"><input id="f_sido" /></div></div>
                        <div><label for="f_sigungu">시군구</label><div class="ctl"><input id="f_sigungu" /></div></div>
                        <div><label for="f_emd">읍면동</label><div class="ctl"><input id="f_emd" /></div></div>

                        <!-- 주소: 지번/도로명 + 주소찾기 -->
                        <div style="grid-column:1/-1">
                            <label for="f_addr_jibun">지번 주소</label>
                            <div class="ctl"><input id="f_addr_jibun" type="text" placeholder="예) 서울 마포구 연남동 123-45" readonly /></div>
                        </div>
                        <div style="grid-column:1/-1">
                            <label for="f_addr_road">도로명 주소</label>
                            <div class="ctl"><input id="f_addr_road" type="text" placeholder="예) 서울 마포구 연남로 123" readonly /></div>
                        </div>
                        <div style="grid-column:1/-1; display:flex; gap:8px">
                            <button type="button" class="btn light" id="btnFindAddr">주소찾기</button>
                        </div>
                    </div>
                </div>

                <!-- 사진 & 좌표 -->
                <div class="card">
                    <h2>현장 사진 & 좌표</h2>
                    <div class="grid">
                        <div style="grid-column:1/-1">
                            <label>사진 업로드</label>
                            <div class="ctl">
                                <input id="f_photo_lib" type="file" accept="image/*,image/heic,image/heif" style="display:none" />
                                <input id="f_photo_cam" type="file" accept="image/*" capture="environment" style="display:none" />
                                <button type="button" class="btn light" id="btnPickFromLibrary">사진첩에서 선택</button>
                                <button type="button" class="btn ghost" id="btnTakePhoto">카메라 촬영</button>
                                <button type="button" class="btn" id="btnUseGeolocation">기기 위치로 좌표</button>
                                <button type="button" class="btn ghost" id="btnClearPhoto">초기화</button>
                            </div>
                        </div>
                        <div style="grid-column:1/-1"><img id="preview" class="thumb" alt="사진 미리보기" /></div>
                        <div><label for="f_lat">위도</label><div class="ctl"><input id="f_lat" class="mono" inputmode="decimal" /></div></div>
                        <div><label for="f_lng">경도</label><div class="ctl"><input id="f_lng" class="mono" inputmode="decimal" /></div></div>
                    </div>
                </div>
            </section>

            <!-- 운영/요금/면수 -->
            <section class="card">
                <h2>운영 · 요금 · 주차면수</h2>
                <div class="grid">
                    <!-- 주차면수(총 + 세부) : 균형형 레이아웃 -->
                    <div style="grid-column:1/-1">
                        <label>주차면수</label>

                        <div class="stalls-section">
                            <!-- 헤더: 총 + 자동반영 -->
                            <div class="stalls-header">
                                <strong>총 주차면수</strong>
                                <label class="auto">
                                    <input type="checkbox" id="autoSum" checked />
                                    세부 합계를 총면수에 자동반영
                                </label>
                            </div>

                            <!-- 총 주차면수 입력(풀폭) -->
                            <div class="stalls-total ctl with-suffix" id="ctl_total">
                                <input id="f_totalStalls" type="number" min="0" inputmode="numeric" placeholder="예) 120" />
                                <span class="suffix">면</span>
                            </div>

                            <!-- 세부 4종을 한 div로 묶음 -->
                            <div class="stalls-details ctl">
                                <div class="mini">
                                    <span class="lbl">장애인</span>
                                    <input id="f_st_dis" type="number" min="0" inputmode="numeric" />
                                    <span class="suffix">면</span>
                                </div>
                                <div class="mini">
                                    <span class="lbl">경차</span>
                                    <input id="f_st_small" type="number" min="0" inputmode="numeric" />
                                    <span class="suffix">면</span>
                                </div>
                                <div class="mini">
                                    <span class="lbl">친환경</span>
                                    <input id="f_st_green" type="number" min="0" inputmode="numeric" />
                                    <span class="suffix">면</span>
                                </div>
                                <div class="mini">
                                    <span class="lbl">임산부</span>
                                    <input id="f_st_preg" type="number" min="0" inputmode="numeric" />
                                    <span class="suffix">면</span>
                                </div>
                            </div>

                            <!-- 미리보기/검증 -->
                            <div id="stallsPreview" class="preview mono">총 0면 (장애인 0, 경차 0, 친환경 0, 임산부 0)</div>
                            <div id="stallsMsg" class="help"></div>
                        </div>
                    </div>

                    <!-- 나머지 폼 동일 (운영주체/관리기관/부제/운영방식/시간대/요금 …) -->
                    <!-- ... (생략: 기존 마크업 그대로 유지) ... -->

                </div>
            </section>

            <section class="card">
                <div class="actions">
                    <button class="btn" id="btnSave">저장</button>
                    <span class="muted">샘플 저장입니다. 실제 API로 교체하세요.</span>
                </div>
            </section>
        </div>
    </div>

    <!-- 주소찾기 레이어 -->
    <div id="postcodeLayer" role="dialog" aria-modal="true" aria-label="주소 검색">
        <div id="postcodeWrap">
            <button id="postcodeClose" class="btn light" type="button">닫기</button>
            <div id="postcodeContainer"></div>
        </div>
    </div>
</main>

<!-- 외부 스크립트 로드 (필요 시 exifr/다음주소 스크립트) -->
<!-- <script src="https://unpkg.com/exifr/dist/exifr.min.js"></script> -->
<!-- <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script> -->

<!-- 페이지 전용 JS (분리본) -->
<script defer src="${pageContext.request.contextPath}/static/js/offparking.js"></script>
</body>
</html>