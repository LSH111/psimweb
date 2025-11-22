<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>노외주차장 상세</title>

    <!-- 공통 CSS -->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/base.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/layout.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/components.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/utilities.css"/>

    <!-- 페이지 전용 CSS -->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/offparking.css"/>

    <!-- 외부 라이브러리 -->
    <script src="https://cdn.jsdelivr.net/npm/exifr@7/dist/full.umd.js"></script>
    <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
    <c:set var="statusCode" value="${empty param.status ? '' : param.status}"/>
    <c:set var="isApproved" value="${statusCode eq '30'}"/>
    <%
        Object parkingObj = request.getAttribute("parking");
        String parkingJson = "null";
        try {
            if (parkingObj != null) {
                parkingJson = new ObjectMapper().writeValueAsString(parkingObj);
            }
        } catch (Exception ignored) {
            parkingJson = "null";
        }
    %>
    <script>
        window.initialParking = <%= parkingJson %>;
    </script>
</head>
<body data-status="${not empty statusCode ? statusCode : (empty param.status ? '' : param.status)}">
<div id="toast-container"></div>
<div class="wrap">
    <header class="card head">
        <div class="title" id="v_name"><c:out value="${empty parking.prkplceNm ? '노외주차장 상세' : parking.prkplceNm}"/></div>
        <span class="badge">노외</span>
        <span class="muted mono" id="v_id"><c:out value="${parking.prkPlceManageNo}"/></span>
        <span class="muted" id="v_addr"><c:out value="${parking.dtadd}"/></span>
        <span class="actions" style="margin-left:auto">
            <button class="btn" onclick="window.print()">인쇄</button>
            <button class="btn" id="btnSaveTop" <c:if test="${isApproved}">disabled="disabled"</c:if>>저장</button>
        </span>
    </header>
    <input type="hidden" id="statusCode" value="${not empty statusCode ? statusCode : (empty param.status ? '' : param.status)}"/>
    <input type="hidden" id="prkPlceManageNo" value="<c:out value='${parking.prkPlceManageNo}'/>"/>
    <input type="hidden" id="prkPlceInfoSn" value="<c:out value='${parking.prkPlceInfoSn}'/>"/>
    <span style="display:none">
        <c:out value="${parking.prkPlceManageNo}"/>
        <c:out value="${parking.prkplceNm}"/>
        <c:out value="${statusCode}"/>
    </span>

    <!-- 기본정보 -->
    <section class="row">
        <div class="card">
            <h2>기본정보</h2>
            <div class="grid">
                <div><label for="f_id">주차장관리번호</label>
                    <div class="ctl"><input id="f_id" class="mono" type="text" value="<c:out value='${parking.prkPlceManageNo}'/>" readonly/></div>
                </div>
                <div><label for="f_name">주차장명</label>
                    <div class="ctl"><input id="f_name" type="text" value="<c:out value='${parking.prkplceNm}'/>" placeholder="예) 분당구청 노외"/></div>
                </div>
                <!-- 🔥 진행상태를 select로 변경 -->
                <div>
                    <label for="f_status">진행상태</label>
                    <div class="ctl">
                        <select id="f_status">

                            <!-- JavaScript에서 동적으로 로드 -->
                        </select>
                    </div>
                </div>
                <div><label for="f_type">주차장구분</label>
                    <div class="ctl"><input id="f_type" type="text" value="노외" readonly/></div>
                </div>
                <!-- 🔥 시도/시군구/읍면동을 select로 변경 -->
                <div>
                    <label for="f_sido">시도</label>
                    <div class="ctl">
                        <select id="f_sido">
                            <option value="">선택</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label for="f_sigungu">시군구</label>
                    <div class="ctl">
                        <select id="f_sigungu" disabled>
                            <option value="">선택</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label for="f_emd">읍면동</label>
                    <div class="ctl">
                        <select id="f_emd" disabled>
                            <option value="">선택</option>
                        </select>
                    </div>
                </div>
                <!-- 🔥 우편번호 hidden 필드 추가 -->
                <input type="hidden" id="f_zip" value="<c:out value='${parking.zip}'/>"/>

                <!-- 🔥 리(里) 추가 -->
                <div>
                    <label for="f_ri">리(里)</label>
                    <div class="ctl">
                        <input id="f_ri" type="text" placeholder="예) 상리"/>
                    </div>
                </div>

                <!-- 🔥 산 여부 라디오 버튼 추가 -->
                <div style="grid-column:1/-1">
                    <label>산 여부</label>
                    <div class="radio-group">
                        <label><input type="radio" name="mountainYn" value="N" checked/> <span>일반</span></label>
                        <label><input type="radio" name="mountainYn" value="Y"/> <span>산</span></label>
                    </div>
                </div>

                <!-- 🔥 본번/부번 추가 -->
                <div>
                    <label for="f_mainNum">본번</label>
                    <div class="ctl">
                        <input id="f_mainNum" type="number" min="0" placeholder="예) 123" inputmode="numeric"/>
                    </div>
                </div>
                <div>
                    <label for="f_subNum">부번</label>
                    <div class="ctl">
                        <input id="f_subNum" type="number" min="0" placeholder="예) 45" inputmode="numeric"/>
                    </div>
                </div>

                <!-- 🔥 건물명 추가 (선택 항목) -->
                <div style="grid-column:1/-1">
                    <label for="f_buildingName">건물명 (선택)</label>
                    <div class="ctl">
                        <input id="f_buildingName" type="text" placeholder="예) 타워팰리스"/>
                    </div>
                </div>

                <!-- 주소: 지번/도로명 + 주소찾기 -->
                <div style="grid-column:1/-1">
                    <label for="f_addr_jibun">지번 주소</label>
                    <div class="ctl"><input id="f_addr_jibun" type="text" value="<c:out value='${parking.dtadd}'/>" placeholder="예) 성남시 분당구 정자동 123-45" readonly/>
                    </div>
                </div>
                <div style="grid-column:1/-1">
                    <label for="f_addr_road">도로명 주소</label>
                    <div class="ctl"><input id="f_addr_road" type="text" value="<c:out value='${parking.rnmadr}'/>" placeholder="예) 분당로 23" readonly/></div>
                </div>
                <div style="grid-column:1/-1; display:flex; gap:8px">
                    <button type="button" class="btn light" id="btnFindAddr">주소찾기</button>
                </div>
            </div>
        </div>
    </section>

    <!-- 사진 & 좌표 섹션 -->
    <section class="row">
        <div class="card section-card photo-section">
            <h2 class="section-header">📸 현장 사진 & 좌표</h2>
            <div class="grid">
                <div style="grid-column:1/-1">
                    <label>사진 업로드</label>
                    <div class="photo-upload-zone">
                        <input id="f_photo_lib" type="file" accept="image/*,image/heic,image/heif"
                               style="display:none"/>
                        <input id="f_photo_cam" type="file" accept="image/*" capture="environment"
                               style="display:none"/>
                        <div class="file-upload-buttons">
                            <button type="button" class="btn light" id="btnPickFromLibrary">📁 사진첩에서 선택</button>
                            <button type="button" class="btn ghost" id="btnTakePhoto">📷 카메라 촬영</button>
                            <button type="button" class="btn" id="btnUseGeolocation">📍 기기 위치로 좌표</button>
                            <button type="button" class="btn ghost" id="btnClearPhoto">🗑️ 초기화</button>
                        </div>
                    </div>
                </div>
                <div style="grid-column:1/-1"><img id="preview" class="thumb" alt="사진 미리보기"/></div>
                <div><label for="f_lat">위도</label>
                    <div class="ctl"><input id="f_lat" class="mono" inputmode="decimal" value="<c:out value='${parking.prkPlceLat}'/>"/></div>
                </div>
                <div><label for="f_lng">경도</label>
                    <div class="ctl"><input id="f_lng" class="mono" inputmode="decimal" value="<c:out value='${parking.prkPlceLon}'/>"/></div>
                </div>
            </div>
        </div>
    </section>

    <!-- 운영 · 요금 · 주차면수 -->
    <section class="card">
        <h2>운영 · 요금 · 주차면수</h2>
        <div class="grid">
            <!-- 총 주차면수 + 세부 -->
            <div style="grid-column:1/-1">
                <!-- 주차장구분 라디오 버튼 추가 -->
                <label>주차장구분</label>
                <div class="radio-group" id="parking_type_group" style="margin-bottom: 16px;">
                    <!-- JavaScript로 동적 로드 (PRK_009) -->
                </div>

                <label for="f_totalStalls">총 주차면수</label>
                <div id="ctl_total" class="ctl">
                    <input id="f_totalStalls" type="number" min="0" inputmode="numeric"
                           style="width:90px; margin-left:6px" placeholder="예) 120"/>
                    <span class="suffix">면</span>
                </div>
                <div id="stallsMsg" class="help" style="margin-top:4px"></div>
                <div class="check-group" style="margin-top:8px">
                    <label><span>일반</span><input id="f_st_normal" type="number" min="0" inputmode="numeric"
                                                 style="width:90px; margin-left:6px"/><span
                            class="suffix">면</span></label>
                    <label><span>장애인</span><input id="f_st_dis" type="number" min="0" inputmode="numeric"
                                                  style="width:90px; margin-left:6px"/><span
                            class="suffix">면</span></label>
                    <label><span>경차</span> <input id="f_st_small" type="number" min="0" inputmode="numeric"
                                                  style="width:90px; margin-left:6px"/><span
                            class="suffix">면</span></label>
                    <label><span>친환경</span><input id="f_st_green" type="number" min="0" inputmode="numeric"
                                                  style="width:90px; margin-left:6px"/><span
                            class="suffix">면</span></label>
                    <label><span>임산부</span><input id="f_st_preg" type="number" min="0" inputmode="numeric"
                                                  style="width:90px; margin-left:6px"/><span
                            class="suffix">면</span></label>
                </div>
            </div>

            <!-- 관리주체(소유주체) -->
            <div style="grid-column:1/-1">
                <label>관리주체(소유주체)</label>
                <div class="radio-group" id="owner_group">
                    <label><input type="radio" name="ownCd" value="1"/> <span>공영</span></label>
                    <label><input type="radio" name="ownCd" value="2"/> <span>민영</span></label>
                    <label><input type="radio" name="ownCd" value="9"/> <span>기타</span></label>
                </div>
                <input type="hidden" id="own_cd" name="own_cd" value=""/>
            </div>

            <!-- 운영주체 -->
            <div style="grid-column:1/-1">
                <label>운영주체</label>
                <div class="radio-group" id="own_group">
                    <label><input type="radio" name="own" value="시운영" checked/> <span>시운영</span></label>
                    <label><input type="radio" name="own" value="구(군)운영"/> <span>구(군)운영</span></label>
                    <label><input type="radio" name="own" value="공단위탁"/> <span>공단위탁</span></label>
                    <label><input type="radio" name="own" value="민간위탁" id="own_private"/> <span>민간위탁</span></label>
                </div>
            </div>
            <div id="own_company_wrap" hidden>
                <label for="f_own_company">민간위탁 업체명</label>
                <div class="ctl"><input id="f_own_company" type="text" placeholder="예) ㈜○○파킹"/></div>
            </div>

            <!-- 관리기관 -->
            <div>
                <label for="f_mgr_name">관리기관명</label>
                <div class="ctl"><input id="f_mgr_name" type="text" placeholder="예) 성남시 주차관리사업소"/></div>
            </div>
            <div>
                <label for="f_mgr_tel">관리기관 전화번호</label>
                <div class="ctl"><input id="f_mgr_tel" type="text" placeholder="예) 031-123-4567" inputmode="tel"/></div>
            </div>

            <!-- 부제 시행 여부 -->
            <div>
                <label for="f_oddEven">부제 시행 여부</label>
                <div class="ctl">
                    <select id="f_oddEven">
                        <!-- JavaScript로 동적 로드 -->
                    </select>
                </div>
            </div>

            <!-- 시간대 -->
            <div style="grid-column:1/-1">
                <label>운영 시간대</label>
                <div class="check-group">
                    <label><input type="checkbox" id="chk_day"/> <span>주간</span></label>
                    <label><input type="checkbox" id="chk_night"/> <span>야간</span></label>
                </div>
            </div>

            <!-- 운영방식 - 초기에는 숨김 -->
            <div id="op_type_wrap" style="grid-column:1/-1; display:none;">
                <label>주차장 운영방식</label>
                <div class="radio-group" id="op_group">
                    <!-- JavaScript로 동적 로드 -->
                </div>
            </div>

            <!-- 주간 세부 - 주간 선택시에만 표시 -->
            <div id="day_detail_wrap" class="grid row-1c" style="grid-column:1/-1; display:none;">
                <div>
                    <label for="f_day_grade">주간 급지</label>
                    <div class="ctl">
                        <select id="f_day_grade">
                            <option value="">선택</option>
                            <!-- JavaScript로 동적 로드 -->
                        </select>
                    </div>
                </div>
            </div>

            <!-- 야간 세부 - 야간 선택시에만 표시 -->
            <div id="night_detail_wrap" class="grid row-1c" style="grid-column:1/-1; display:none;">
                <div>
                    <label for="f_night_grade">야간 급지</label>
                    <div class="ctl">
                        <select id="f_night_grade">
                            <option value="">선택</option>
                            <!-- JavaScript로 동적 로드 -->
                        </select>
                    </div>
                </div>
            </div>

            <!-- 주간 요금부과여부 - 주간 선택시에만 표시 -->
            <div id="day_fee_charge_wrap" class="fee-block card" style="grid-column:1/-1; display:none;">
                <h2 class="fee-title">주간 요금 부과여부</h2>
                <div class="grid row-1c">
                    <div>
                        <label for="f_day_feeType">주간 요금 부과여부</label>
                        <div class="ctl">
                            <select id="f_day_feeType">
                                <option value="">선택</option>
                                <!-- JavaScript로 동적 로드 -->
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 야간 요금부과여부 - 야간 선택시에만 표시 -->
            <div id="night_fee_charge_wrap" class="fee-block card" style="grid-column:1/-1; display:none;">
                <h2 class="fee-title">야간 요금 부과여부</h2>
                <div class="grid row-1c">
                    <div>
                        <label for="f_night_feeType">야간 요금 부과여부</label>
                        <div class="ctl">
                            <select id="f_night_feeType">
                                <option value="">선택</option>
                                <!-- JavaScript로 동적 로드 -->
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 주간 요금수준 - 주간 선택시에만 표시 -->
            <div id="day_fee_level_wrap" class="fee-level card" style="grid-column:1/-1; display:none;">
                <h2 class="fee-title">주간 요금수준</h2>

                <!-- (A) 거주자우선주차장 요금 -->
                <div id="day_res_fee_wrap" class="grid row-1c" hidden>
                    <h3 class="help" style="margin:.2rem 0">거주자우선주차장 요금(원) - 주간</h3>
                    <div class="fee-group">
                        <div class="fee-item">
                            <label for="f_day_res_all">전일</label>
                            <div class="ctl"><input id="f_day_res_all" type="text" inputmode="numeric"
                                                    placeholder="예) 5000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_day_res_day">주간</label>
                            <div class="ctl"><input id="f_day_res_day" type="text" inputmode="numeric"
                                                    placeholder="예) 3000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_day_res_full">상근</label>
                            <div class="ctl"><input id="f_day_res_full" type="text" inputmode="numeric"
                                                    placeholder="예) 4000"/><span class="suffix">원</span></div>
                        </div>
                    </div>
                </div>

                <!-- (B) 일반노상주차장 요금 -->
                <div id="day_normal_fee_wrap" hidden>
                    <h3 class="help" style="margin:.2rem 0">일반노상주차장 요금(승용차, 일반인 기준) - 주간</h3>
                    <div class="fee-group">
                        <div class="fee-item">
                            <label for="f_day_fee_first30">최초 30분</label>
                            <div class="ctl"><input id="f_day_fee_first30" type="text" inputmode="numeric"
                                                    placeholder="예) 1000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_day_fee_per10">매 10분</label>
                            <div class="ctl"><input id="f_day_fee_per10" type="text" inputmode="numeric"
                                                    placeholder="예) 300"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_day_fee_per60">1시간</label>
                            <div class="ctl"><input id="f_day_fee_per60" type="text" inputmode="numeric"
                                                    placeholder="예) 2000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_day_fee_daily">전일(일)</label>
                            <div class="ctl"><input id="f_day_fee_daily" type="text" inputmode="numeric"
                                                    placeholder="예) 10000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_day_fee_monthly">월정기권</label>
                            <div class="ctl"><input id="f_day_fee_monthly" type="text" inputmode="numeric"
                                                    placeholder="예) 120000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_day_fee_halfyear">반기권</label>
                            <div class="ctl"><input id="f_day_fee_halfyear" type="text" inputmode="numeric"
                                                    placeholder="예) 600000"/><span class="suffix">원</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 야간 요금수준 - 야간 선택시에만 표시 -->
            <div id="night_fee_level_wrap" class="fee-level card" style="grid-column:1/-1; display:none;">
                <h2 class="fee-title">야간 요금수준</h2>

                <!-- (A) 거주자우선주차장 요금 -->
                <div id="night_res_fee_wrap" class="grid row-1c" hidden>
                    <h3 class="help" style="margin:.2rem 0">거주자우선주차장 요금(원) - 야간</h3>
                    <div class="fee-group">
                        <div class="fee-item">
                            <label for="f_night_res_all">전일</label>
                            <div class="ctl"><input id="f_night_res_all" type="text" inputmode="numeric"
                                                    placeholder="예) 5000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_night_res_full">상근</label>
                            <div class="ctl"><input id="f_night_res_full" type="text" inputmode="numeric"
                                                    placeholder="예) 4000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_night_res_night">야간</label>
                            <div class="ctl"><input id="f_night_res_night" type="text" inputmode="numeric"
                                                    placeholder="예) 2000"/><span class="suffix">원</span></div>
                        </div>
                    </div>
                </div>

                <!-- (B) 일반노상주차장 요금 -->
                <div id="night_normal_fee_wrap" hidden>
                    <h3 class="help" style="margin:.2rem 0">일반노상주차장 요금(승용차, 일반인 기준) - 야간</h3>
                    <div class="fee-group">
                        <div class="fee-item">
                            <label for="f_night_fee_first30">최초 30분</label>
                            <div class="ctl"><input id="f_night_fee_first30" type="text" inputmode="numeric"
                                                    placeholder="예) 800"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_night_fee_per10">매 10분</label>
                            <div class="ctl"><input id="f_night_fee_per10" type="text" inputmode="numeric"
                                                    placeholder="예) 200"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_night_fee_per60">1시간</label>
                            <div class="ctl"><input id="f_night_fee_per60" type="text" inputmode="numeric"
                                                    placeholder="예) 1500"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_night_fee_daily">전일(일)</label>
                            <div class="ctl"><input id="f_night_fee_daily" type="text" inputmode="numeric"
                                                    placeholder="예) 8000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_night_fee_monthly">월정기권</label>
                            <div class="ctl"><input id="f_night_fee_monthly" type="text" inputmode="numeric"
                                                    placeholder="예) 100000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_night_fee_halfyear">반기권</label>
                            <div class="ctl"><input id="f_night_fee_halfyear" type="text" inputmode="numeric"
                                                    placeholder="예) 500000"/><span class="suffix">원</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 주간 요금지불방식 - 주간 선택시에만 표시 -->
            <div id="day_fee_pay_wrap" class="fee-block card" style="grid-column:1/-1; display:none;">
                <h2 class="fee-title">주간 요금 지불방식</h2>
                <div class="grid row-1c">
                    <div class="check-group" id="day_pay_group" aria-label="주간 요금 지불방식">
                        <!-- JavaScript로 동적 생성 -->
                    </div>
                </div>
            </div>

            <!-- 야간 요금지불방식 - 야간 선택시에만 표시 -->
            <div id="night_fee_pay_wrap" class="fee-block card" style="grid-column:1/-1; display:none;">
                <h2 class="fee-title">야간 요금 지불방식</h2>
                <div class="grid row-1c">
                    <div class="check-group" id="night_pay_group" aria-label="야간 요금 지불방식">
                        <!-- JavaScript로 동적 생성 -->
                    </div>
                </div>
            </div>

            <!-- 주간 요금정산방식 - 주간 선택시에만 표시 -->
            <div id="day_fee_settle_wrap" class="fee-block card" style="grid-column:1/-1; display:none;">
                <h2 class="fee-title">주간 요금 정산방식</h2>
                <div class="grid row-1c">
                    <div id="day_settle_group" class="check-group">
                        <!-- 동적으로 생성됨 -->
                    </div>
                </div>
            </div>

            <!-- 야간 요금정산방식 - 야간 선택시에만 표시 -->
            <div id="night_fee_settle_wrap" class="fee-block card" style="grid-column:1/-1; display:none;">
                <h2 class="fee-title">야간 요금 정산방식</h2>
                <div class="grid row-1c">
                    <div id="night_settle_group" class="check-group">
                        <!-- 동적으로 생성됨 -->
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 주간 운영시간 섹션 - 주간 선택시에만 표시 -->
    <section class="card" id="day_operation_time_section" style="display:none;">
        <h2>주간 운영시간</h2>
        <div class="grid">
            <!-- 평일 -->
            <div class="operation-day-block" style="grid-column:1/-1">
                <h3 class="operation-day-title">평일</h3>
                <div class="radio-group" id="day_weekday_operation_group">
                    <!-- JavaScript로 동적 생성 -->
                </div>
                <div class="time-inputs-wrapper weekday-time" id="day_weekday_time_inputs" style="display:none;">
                    <div class="time-inputs highlight-input-area">
                        <span class="time-label">주간 평일 운영시간:</span>
                        <div class="time-input-group">
                            <input type="number" id="day_weekday_start_hour" min="0" max="23" placeholder="시"
                                   class="time-input"/>
                            <span class="time-unit">시</span>
                            <input type="number" id="day_weekday_start_min" min="0" max="59" placeholder="분"
                                   class="time-input"/>
                            <span class="time-unit">분</span>
                            <span class="time-separator">~</span>
                            <input type="number" id="day_weekday_end_hour" min="0" max="23" placeholder="시"
                                   class="time-input"/>
                            <span class="time-unit">시</span>
                            <input type="number" id="day_weekday_end_min" min="0" max="59" placeholder="분"
                                   class="time-input"/>
                            <span class="time-unit">분</span>
                        </div>
                        <div class="input-guide">주간 평일 운영시간을 입력해주세요 (24시간 형식)</div>
                    </div>
                </div>
            </div>

            <!-- 토요일 -->
            <div class="operation-day-block" style="grid-column:1/-1; margin-top:16px;">
                <h3 class="operation-day-title">토요일</h3>
                <div class="radio-group" id="day_saturday_operation_group">
                    <!-- JavaScript로 동적 생성 -->
                </div>
                <div class="time-inputs-wrapper saturday-time" id="day_saturday_time_inputs" style="display:none;">
                    <div class="time-inputs highlight-input-area">
                        <span class="time-label">주간 토요일 운영시간:</span>
                        <div class="time-input-group">
                            <input type="number" id="day_saturday_start_hour" min="0" max="23" placeholder="시"
                                   class="time-input"/>
                            <span class="time-unit">시</span>
                            <input type="number" id="day_saturday_start_min" min="0" max="59" placeholder="분"
                                   class="time-input"/>
                            <span class="time-unit">분</span>
                            <span class="time-separator">~</span>
                            <input type="number" id="day_saturday_end_hour" min="0" max="23" placeholder="시"
                                   class="time-input"/>
                            <span class="time-unit">시</span>
                            <input type="number" id="day_saturday_end_min" min="0" max="59" placeholder="분"
                                   class="time-input"/>
                            <span class="time-unit">분</span>
                        </div>
                        <div class="input-guide">주간 토요일 운영시간을 입력해주세요 (24시간 형식)</div>
                    </div>
                </div>
            </div>

            <!-- 공휴일 -->
            <div class="operation-day-block" style="grid-column:1/-1; margin-top:16px;">
                <h3 class="operation-day-title">공휴일</h3>
                <div class="radio-group" id="day_holiday_operation_group">
                    <!-- JavaScript로 동적 생성 -->
                </div>
                <div class="time-inputs-wrapper holiday-time" id="day_holiday_time_inputs" style="display:none;">
                    <div class="time-inputs highlight-input-area">
                        <span class="time-label">주간 공휴일 운영시간:</span>
                        <div class="time-input-group">
                            <input type="number" id="day_holiday_start_hour" min="0" max="23" placeholder="시"
                                   class="time-input"/>
                            <span class="time-unit">시</span>
                            <input type="number" id="day_holiday_start_min" min="0" max="59" placeholder="분"
                                   class="time-input"/>
                            <span class="time-unit">분</span>
                            <span class="time-separator">~</span>
                            <input type="number" id="day_holiday_end_hour" min="0" max="23" placeholder="시"
                                   class="time-input"/>
                            <span class="time-unit">시</span>
                            <input type="number" id="day_holiday_end_min" min="0" max="59" placeholder="분"
                                   class="time-input"/>
                            <span class="time-unit">분</span>
                        </div>
                        <div class="input-guide">주간 공휴일 운영시간을 입력해주세요 (24시간 형식)</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 야간 운영시간 섹션 - 야간 선택시에만 표시 -->
    <section class="card" id="night_operation_time_section" style="display:none;">
        <h2>야간 운영시간</h2>
        <div class="grid">
            <!-- 평일 -->
            <div class="operation-day-block" style="grid-column:1/-1">
                <h3 class="operation-day-title">평일</h3>
                <div class="radio-group" id="night_weekday_operation_group">
                    <!-- JavaScript로 동적 생성 -->
                </div>
                <div class="time-inputs-wrapper weekday-time" id="night_weekday_time_inputs" style="display:none;">
                    <div class="time-inputs highlight-input-area">
                        <span class="time-label">야간 평일 운영시간:</span>
                        <div class="time-input-group">
                            <input type="number" id="night_weekday_start_hour" min="0" max="23" placeholder="시"
                                   class="time-input"/>
                            <span class="time-unit">시</span>
                            <input type="number" id="night_weekday_start_min" min="0" max="59" placeholder="분"
                                   class="time-input"/>
                            <span class="time-unit">분</span>
                            <span class="time-separator">~</span>
                            <input type="number" id="night_weekday_end_hour" min="0" max="23" placeholder="시"
                                   class="time-input"/>
                            <span class="time-unit">시</span>
                            <input type="number" id="night_weekday_end_min" min="0" max="59" placeholder="분"
                                   class="time-input"/>
                            <span class="time-unit">분</span>
                        </div>
                        <div class="input-guide">야간 평일 운영시간을 입력해주세요 (24시간 형식)</div>
                    </div>
                </div>
            </div>

            <!-- 토요일 -->
            <div class="operation-day-block" style="grid-column:1/-1; margin-top:16px;">
                <h3 class="operation-day-title">토요일</h3>
                <div class="radio-group" id="night_saturday_operation_group">
                    <!-- JavaScript로 동적 생성 -->
                </div>
                <div class="time-inputs-wrapper saturday-time" id="night_saturday_time_inputs" style="display:none;">
                    <div class="time-inputs highlight-input-area">
                        <span class="time-label">야간 토요일 운영시간:</span>
                        <div class="time-input-group">
                            <input type="number" id="night_saturday_start_hour" min="0" max="23" placeholder="시"
                                   class="time-input"/>
                            <span class="time-unit">시</span>
                            <input type="number" id="night_saturday_start_min" min="0" max="59" placeholder="분"
                                   class="time-input"/>
                            <span class="time-unit">분</span>
                            <span class="time-separator">~</span>
                            <input type="number" id="night_saturday_end_hour" min="0" max="23" placeholder="시"
                                   class="time-input"/>
                            <span class="time-unit">시</span>
                            <input type="number" id="night_saturday_end_min" min="0" max="59" placeholder="분"
                                   class="time-input"/>
                            <span class="time-unit">분</span>
                        </div>
                        <div class="input-guide">야간 토요일 운영시간을 입력해주세요 (24시간 형식)</div>
                    </div>
                </div>
            </div>

            <!-- 공휴일 -->
            <div class="operation-day-block" style="grid-column:1/-1; margin-top:16px;">
                <h3 class="operation-day-title">공휴일</h3>
                <div class="radio-group" id="night_holiday_operation_group">
                    <!-- JavaScript로 동적 생성 -->
                </div>
                <div class="time-inputs-wrapper holiday-time" id="night_holiday_time_inputs" style="display:none;">
                    <div class="time-inputs highlight-input-area">
                        <span class="time-label">야간 공휴일 운영시간:</span>
                        <div class="time-input-group">
                            <input type="number" id="night_holiday_start_hour" min="0" max="23" placeholder="시"
                                   class="time-input"/>
                            <span class="time-unit">시</span>
                            <input type="number" id="night_holiday_start_min" min="0" max="59" placeholder="분"
                                   class="time-input"/>
                            <span class="time-unit">분</span>
                            <span class="time-separator">~</span>
                            <input type="number" id="night_holiday_end_hour" min="0" max="23" placeholder="시"
                                   class="time-input"/>
                            <span class="time-unit">시</span>
                            <input type="number" id="night_holiday_end_min" min="0" max="59" placeholder="분"
                                   class="time-input"/>
                            <span class="time-unit">분</span>
                        </div>
                        <div class="input-guide">야간 공휴일 운영시간을 입력해주세요 (24시간 형식)</div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- 주차관리 시설 정보 섹션 추가 -->
    <section class="card">
        <h2>주차관리 시설 정보</h2>
        <div class="grid">
            <!-- 1) 주차장표지판 유무 -->
            <div style="grid-column:1/-1">
                <label>주차장표지판 유무</label>
                <div class="radio-group" id="sign_group">
                    <label><input type="radio" name="parkingSign" value="Y" id="sign_yes"/> <span>있음</span></label>
                    <label><input type="radio" name="parkingSign" value="N" id="sign_no" checked/>
                        <span>없음</span></label>
                </div>
            </div>

            <!-- 표지판 사진 업로드 영역 -->
            <div id="sign_photo_wrap" style="grid-column:1/-1; display:none;">
                <label>표지판 사진</label>
                <div class="photo-upload-zone">
                    <input id="f_sign_photo_lib" type="file" accept="image/*,image/heic,image/heif"
                           style="display:none"/>
                    <input id="f_sign_photo_cam" type="file" accept="image/*" capture="environment"
                           style="display:none"/>
                    <div class="file-upload-buttons">
                        <button type="button" class="btn light" id="btnSignPhotoLibrary">📁 사진첩에서 선택</button>
                        <button type="button" class="btn ghost" id="btnSignPhotoCamera">📷 카메라 촬영</button>
                        <button type="button" class="btn ghost" id="btnClearSignPhoto">🗑️ 초기화</button>
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <img id="sign_preview" class="thumb" alt="표지판 사진" style="display:none;"/>
                </div>
            </div>

            <!-- 2) 발권기 유무 -->
            <div style="grid-column:1/-1">
                <label>발권기 유무</label>
                <div class="radio-group" id="ticket_machine_group">
                    <label><input type="radio" name="ticketMachine" value="Y" id="ticket_yes"/> <span>있음</span></label>
                    <label><input type="radio" name="ticketMachine" value="N" id="ticket_no" checked/>
                        <span>없음</span></label>
                </div>
            </div>

            <!-- 발권기 사진 업로드 영역 -->
            <div id="ticket_photo_wrap" style="grid-column:1/-1; display:none;">
                <label>발권기 사진</label>
                <div class="photo-upload-zone">
                    <input id="f_ticket_photo_lib" type="file" accept="image/*,image/heic,image/heif"
                           style="display:none"/>
                    <input id="f_ticket_photo_cam" type="file" accept="image/*" capture="environment"
                           style="display:none"/>
                    <div class="file-upload-buttons">
                        <button type="button" class="btn light" id="btnTicketPhotoLibrary">📁 사진첩에서 선택</button>
                        <button type="button" class="btn ghost" id="btnTicketPhotoCamera">📷 카메라 촬영</button>
                        <button type="button" class="btn ghost" id="btnClearTicketPhoto">🗑️ 초기화</button>
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <img id="ticket_preview" class="thumb" alt="발권기 사진" style="display:none;"/>
                </div>
            </div>

            <!-- 3) 차단기 유무 -->
            <div style="grid-column:1/-1">
                <label>차단기 유무</label>
                <div class="radio-group" id="barrier_group">
                    <label><input type="radio" name="barrier" value="Y" id="barrier_yes"/> <span>있음</span></label>
                    <label><input type="radio" name="barrier" value="N" id="barrier_no" checked/>
                        <span>없음</span></label>
                </div>
            </div>

            <!-- 차단기 사진 업로드 영역 -->
            <div id="barrier_photo_wrap" style="grid-column:1/-1; display:none;">
                <label>차단기 사진</label>
                <div class="photo-upload-zone">
                    <input id="f_barrier_photo_lib" type="file" accept="image/*,image/heic,image/heif"
                           style="display:none"/>
                    <input id="f_barrier_photo_cam" type="file" accept="image/*" capture="environment"
                           style="display:none"/>
                    <div class="file-upload-buttons">
                        <button type="button" class="btn light" id="btnBarrierPhotoLibrary">📁 사진첩에서 선택</button>
                        <button type="button" class="btn ghost" id="btnBarrierPhotoCamera">📷 카메라 촬영</button>
                        <button type="button" class="btn ghost" id="btnClearBarrierPhoto">🗑️ 초기화</button>
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <img id="barrier_preview" class="thumb" alt="차단기 사진" style="display:none;"/>
                </div>
            </div>

            <!-- 차량인식종류 (차단기 '있음'인 경우만 표시) -->
            <div id="vehicle_recognition_wrap" style="grid-column:1/-1; display:none;">
                <label>차량인식종류</label>
                <div class="radio-group" id="vehicle_recognition_group" style="margin-bottom: 16px;">
                    <!-- JavaScript로 동적 로드 (PRK_008) -->
                </div>
            </div>

            <!-- 출차알람 유무 -->
            <div style="grid-column:1/-1">
                <label>출차알람 유무</label>
                <div class="radio-group" id="exit_alarm_group">
                    <label><input type="radio" name="exitAlarm" value="Y" id="exit_alarm_yes"/> <span>있음</span></label>
                    <label><input type="radio" name="exitAlarm" value="N" id="exit_alarm_no" checked/>
                        <span>없음</span></label>
                </div>
            </div>

            <!-- 출차알람 사진 업로드 영역 -->
            <div id="exit_alarm_photo_wrap" style="grid-column:1/-1; display:none;">
                <label>출차알람 사진</label>
                <div class="photo-upload-zone">
                    <input id="f_exit_alarm_photo_lib" type="file" accept="image/*,image/heic,image/heif"
                           style="display:none"/>
                    <input id="f_exit_alarm_photo_cam" type="file" accept="image/*" capture="environment"
                           style="display:none"/>
                    <div class="file-upload-buttons">
                        <button type="button" class="btn light" id="btnExitAlarmPhotoLibrary">📁 사진첩에서 선택</button>
                        <button type="button" class="btn ghost" id="btnExitAlarmPhotoCamera">📷 카메라 촬영</button>
                        <button type="button" class="btn ghost" id="btnClearExitAlarmPhoto">🗑️ 초기화</button>
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <img id="exit_alarm_preview" class="thumb" alt="출차알람 사진" style="display:none;"/>
                </div>
            </div>
        </div>
    </section>

    <!-- 주차 첨두시간 섹션 -->
    <section class="card">
        <h2>주차 첨두</h2>
        <div class="grid">
            <!-- 1) 주간(07~20시) -->
            <div style="grid-column:1/-1">
                <label>1) 주간(07~20시)</label>
                <div class="help" style="margin-bottom:8px;">최소값: 07시 이상 / 최대값: 20시 이하</div>
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <span style="color:var(--muted);">첨두시간대:</span>
                    <div class="ctl" style="flex:0 0 auto; width:100px;">
                        <input id="f_peak_day_start" type="number" min="7" max="20" placeholder="07"
                               inputmode="numeric"/>
                        <span class="suffix">시</span>
                    </div>
                    <span style="color:var(--muted);">~</span>
                    <div class="ctl" style="flex:0 0 auto; width:100px;">
                        <input id="f_peak_day_end" type="number" min="7" max="20" placeholder="20" inputmode="numeric"/>
                        <span class="suffix">시</span>
                    </div>
                    <span style="color:var(--muted);">주차대수:</span>
                    <div class="ctl" style="flex:0 0 auto; width:120px;">
                        <input id="f_peak_day_count" type="number" min="0" placeholder="예) 80" inputmode="numeric"/>
                        <span class="suffix">대</span>
                    </div>
                </div>
            </div>

            <!-- 2) 야간(20시~익일07시) -->
            <div style="grid-column:1/-1">
                <label>2) 야간(20시~익일07시)</label>
                <div class="help" style="margin-bottom:8px;">최소값: 20시 이상 / 최대값: 익일 07시 이하</div>
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <span style="color:var(--muted);">첨두시간대:</span>
                    <div class="ctl" style="flex:0 0 auto; width:100px;">
                        <input id="f_peak_night_start" type="number" min="20" max="23" placeholder="20"
                               inputmode="numeric"/>
                        <span class="suffix">시</span>
                    </div>
                    <span style="color:var(--muted);">~</span>
                    <div class="ctl" style="flex:0 0 auto; width:100px;">
                        <input id="f_peak_night_end" type="number" min="0" max="7" placeholder="07"
                               inputmode="numeric"/>
                        <span class="suffix">시</span>
                    </div>
                    <span style="color:var(--muted);">주차대수:</span>
                    <div class="ctl" style="flex:0 0 auto; width:120px;">
                        <input id="f_peak_night_count" type="number" min="0" placeholder="예) 100" inputmode="numeric"/>
                        <span class="suffix">대</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 위치 (주차장입구) 섹션 -->
    <section class="card">
        <h2>위치 (주차장입구)</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <label>주차장 입구 사진</label>
                <div class="photo-upload-zone">
                    <input id="f_entrance_photo_lib" type="file" accept="image/*,image/heic,image/heif"
                           style="display:none"/>
                    <input id="f_entrance_photo_cam" type="file" accept="image/*" capture="environment"
                           style="display:none"/>
                    <div class="file-upload-buttons">
                        <button type="button" class="btn light" id="btnEntrancePhotoLibrary">📁 사진첩에서 선택</button>
                        <button type="button" class="btn ghost" id="btnEntrancePhotoCamera">📷 카메라 촬영</button>
                        <button type="button" class="btn ghost" id="btnClearEntrancePhoto">🗑️ 초기화</button>
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <img id="entrance_preview" class="thumb" alt="입구 사진" style="display:none;"/>
                </div>
            </div>

            <div><label for="f_entrance_lat">위도</label>
                <div class="ctl"><input id="f_entrance_lat" class="mono" inputmode="decimal" readonly/></div>
            </div>
            <div><label for="f_entrance_lng">경도</label>
                <div class="ctl"><input id="f_entrance_lng" class="mono" inputmode="decimal" readonly/></div>
            </div>
        </div>
    </section>

    <!-- 사전점검 섹션 -->
    <section class="card">
        <h2>사전점검</h2>
        <div class="grid">
            <!-- 2층 이상 건축물 주차장여부 -->
            <div style="grid-column:1/-1">
                <label>2층 이상 건축물 주차장여부</label>
                <div class="radio-group" id="building_floor_group">
                    <label><input type="radio" name="buildingFloor" value="1층" checked/> <span>1층</span></label>
                    <label><input type="radio" name="buildingFloor" value="2층이상"/> <span>2층 이상</span></label>
                </div>
            </div>

            <!-- 추락방지시설 유무 (2층 이상인 경우만 표시) -->
            <div id="fall_prevention_wrap" style="grid-column:1/-1; display:none;">
                <label>추락방지시설 유무</label>
                <div class="radio-group" id="fall_prevention_group">
                    <label><input type="radio" name="fallPrevention" value="Y"/> <span>있음</span></label>
                    <label><input type="radio" name="fallPrevention" value="N"/> <span>없음</span></label>
                </div>
            </div>

            <!-- 주차방향시설 유무 -->
            <div style="grid-column:1/-1">
                <label>주차방향시설 유무</label>
                <div class="radio-group" id="parking_guide_group">
                    <label><input type="radio" name="parkingGuide" value="Y"/> <span>있음</span></label>
                    <label><input type="radio" name="parkingGuide" value="N" checked/> <span>없음</span></label>
                </div>
            </div>

            <!-- 경사 여부 -->
            <div style="grid-column:1/-1">
                <label>경사 여부</label>
                <div class="radio-group" id="slope_group">
                    <label><input type="radio" name="slope" value="Y" id="slope_yes"/> <span>있음</span></label>
                    <label><input type="radio" name="slope" value="N" id="slope_no" checked/> <span>없음</span></label>
                </div>
            </div>

            <!-- 7% 초과 입력창 (경사 '있음'인 경우만 표시) -->
            <div id="slope_over_7_wrap" style="grid-column:1/-1; display:none;">
                <label>7% 초과</label>
                <div class="ctl" style="width:120px;">
                    <input id="f_slope_over_7_value" type="text" placeholder="예) 8" inputmode="numeric"/>
                    <span class="suffix">면</span>
                </div>
            </div>

            <!-- 안전시설 -->
            <div style="grid-column:1/-1">
                <label>안전시설</label>
                <div class="check-group" id="safety_group" aria-label="안전시설 (중복선택 가능)">
                    <label><input type="checkbox" name="safetyFacility" value="Y" id="antislp_facility_chk"/> <span>미끄럼 방지시설(스토퍼, 고임목 등)</span></label>
                    <label><input type="checkbox" name="safetyFacility" value="Y" id="slp_guide_sign_chk"/> <span>미끄럼 주의 안내표지판</span></label>
                </div>
            </div>

            <!-- 보행안전시설 (총 주차면수 400면 이상인 경우만 활성화) -->
            <div id="pedestrian_safety_wrap" style="grid-column:1/-1; opacity: 0.5; pointer-events: none;">
                <label>보행안전시설</label>
                <div class="help" style="margin-bottom:8px; color:var(--muted);">※ 총 주차면수 400면 이상인 경우만 입력 가능</div>
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <span style="color:var(--muted);">1) 과속방지턱</span>
                    <div class="ctl" style="flex:0 0 auto; width:100px;">
                        <input id="f_speed_bump_count" type="number" min="0" placeholder="0" inputmode="numeric"
                               disabled/>
                        <span class="suffix">개</span>
                    </div>

                    <span style="color:var(--muted); margin-left:16px;">2) 원산차선</span>
                    <div class="ctl" style="flex:0 0 auto; width:100px;">
                        <input id="f_crosswalk_count" type="number" min="0" placeholder="0" inputmode="numeric"
                               disabled/>
                        <span class="suffix">개</span>
                    </div>

                    <span style="color:var(--muted); margin-left:16px;">3) 횡단보도</span>
                    <div class="ctl" style="flex:0 0 auto; width:100px;">
                        <input id="f_pedestrian_crossing_count" type="number" min="0" placeholder="0"
                               inputmode="numeric" disabled/>
                        <span class="suffix">개</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 비고 섹션 -->
    <section class="card section-card">
        <h2 class="section-header">비고</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <label for="f_partclr_matter">특이사항</label>
                <div class="ctl">
                    <textarea id="f_partclr_matter" name="rmk" rows="8" placeholder="주차장 관련 특이사항을 입력하세요"><c:out value="${parking.partclrMatter}"/></textarea>
                </div>
            </div>
        </div>
    </section>

    <!-- 저장 버튼 섹션 -->
    <section class="card">
        <div class="actions" style="justify-content: center;">
            <button class="btn btn-save" id="btnSave" <c:if test="${isApproved}">disabled="disabled"</c:if>>💾 저장하기</button>
        </div>
    </section>
</div>

<!-- 주소찾기 레이어 -->
<div id="postcodeLayer" role="dialog" aria-modal="true" aria-label="주소 검색">
    <div id="postcodeWrap">
        <button id="postcodeClose" class="btn light" type="button">닫기</button>
        <div id="postcodeContainer"></div>
    </div>
</div>
<!-- 페이지 전용 JS -->
<script src="${pageContext.request.contextPath}/static/js/common/dom-utils.js"></script>
<script src="${pageContext.request.contextPath}/static/js/common/format-utils.js"></script>
<script src="${pageContext.request.contextPath}/static/js/common/code-api.js"></script>
<script src="${pageContext.request.contextPath}/static/js/component/toast.js"></script>
<script src="${pageContext.request.contextPath}/static/js/component/modal.js"></script>
<script src="${pageContext.request.contextPath}/static/js/page/parking/offparking.js"></script>
</body>
</html>
