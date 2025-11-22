<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>부설주차장 상세</title>

    <!-- 공통 CSS -->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/base.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/layout.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/components.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/utilities.css"/>

    <!-- 페이지 전용 CSS -->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/buildparking.css"/>

    <!-- 외부 라이브러리 (EXIF / 다음 우편번호) -->
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
<div class="wrap">
    <header class="card head">
        <div class="title" id="v_name"><c:out value="${empty parking.prkplceNm ? '부설주차장 상세' : parking.prkplceNm}"/></div>
        <span class="badge">부설</span>
        <span class="muted mono" id="v_id"><c:out value="${parking.prkPlceManageNo}"/></span>
        <span class="muted" id="v_addr">
            <c:out value="${parking.sidoNm}"/>
            <c:if test="${not empty parking.sigunguNm}"> <c:out value="${parking.sigunguNm}"/></c:if>
            <c:if test="${not empty parking.lgalEmdNm}"> <c:out value="${parking.lgalEmdNm}"/></c:if>
            <c:if test="${not empty parking.dtadd}"> · <c:out value="${parking.dtadd}"/></c:if>
        </span>
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

    <!-- 기본정보 섹션 -->
    <section class="row">
        <div class="card section-card">
            <h2 class="section-header">📋 기본정보</h2>
            <div class="grid">
                <div><label for="f_id">주차장관리번호</label>
                    <div class="ctl"><input id="f_id" class="mono" type="text" value="<c:out value='${parking.prkPlceManageNo}'/>" readonly/></div>
                </div>
                <div><label for="f_name">주차장명</label>
                    <div class="ctl"><input id="f_name" type="text" value="<c:out value='${parking.prkplceNm}'/>" placeholder="예) 상암DMC 복합"/></div>
                </div>
                <!-- 🔥 진행상태를 select로 변경 -->
                <div>
                    <label for="f_status">진행상태</label>
                    <div class="ctl">
                        <select id="f_status" data-default-status="${not empty parking.prgsStsCd ? parking.prgsStsCd : statusCode}">
                            <option value="">선택</option>
                        </select>
                    </div>
                </div>
                <div><label for="f_type">주차장구분</label>
                    <div class="ctl"><input id="f_type" type="text" value="부설" readonly/></div>
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
                    <div class="ctl"><input id="f_addr_jibun" type="text" value="<c:out value='${parking.dtadd}'/>" placeholder="예) 서울 마포구 연남동 123-45" readonly/>
                    </div>
                </div>
                <div style="grid-column:1/-1">
                    <label for="f_addr_road">도로명 주소</label>
                    <div class="ctl"><input id="f_addr_road" type="text" value="<c:out value='${parking.rnmadr}'/>" placeholder="예) 서울 마포구 연남로 123" readonly/>
                    </div>
                </div>
                <div style="grid-column:1/-1">
                    <button type="button" class="btn light" id="btnFindAddr">🔍 주소찾기</button>
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

                        <!-- 파일 업로드 진행률 표시 영역 -->
                        <div id="upload-progress-area" class="upload-progress-container" style="display: none;">
                            <div class="upload-header">
                                <h3 class="upload-title">첨부파일 업로드</h3>
                            </div>

                            <div class="upload-summary">
                                <span class="upload-status">0개 / 1개</span>
                                <span class="upload-size">0MB / 0MB</span>
                                <span class="upload-percent">0% 남음</span>
                            </div>

                            <div class="progress-bar-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progress-fill"></div>
                                </div>
                                <span class="progress-text" id="progress-text">0%</span>
                            </div>

                            <div class="file-list">
                                <div class="file-item" id="upload-file-item" style="display: none;">
                                    <div class="file-icon">📁</div>
                                    <div class="file-info">
                                        <div class="file-name" id="file-name">파일명.jpg</div>
                                        <div class="file-size-progress">
                                            <div class="file-progress-bar">
                                                <div class="file-progress-fill" id="file-progress-fill"></div>
                                            </div>
                                            <span class="file-size" id="file-size">0MB / 0MB</span>
                                        </div>
                                    </div>
                                    <div class="file-status" id="file-status">전송중</div>
                                </div>
                            </div>

                            <div class="upload-actions">
                                <button type="button" class="btn-cancel" id="btn-upload-cancel">취소</button>
                                <button type="button" class="btn-complete" id="btn-upload-complete"
                                        style="display: none;">완료
                                </button>
                            </div>
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

    <!-- 운영 · 요금 · 주차면수 섹션 -->
    <section class="card section-card">
        <h2 class="section-header">🚗 운영 · 요금 · 주차면수</h2>
        <div class="grid">
            <!-- 총 주차면수 + 세부 -->
            <div style="grid-column:1/-1">
                <div class="subsection">
                    <h3 class="subsection-title">주차장 구분</h3>
                    <div class="radio-group" id="parking_type_group" style="margin-bottom: 16px;">
                        <!-- JavaScript로 동적 로드 (PRK_009) -->
                    </div>
                </div>

                <div class="subsection">
                    <h3 class="subsection-title">허가 및 검사 정보</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
                        <div>
                            <label for="f_permit_date">허가일자</label>
                            <div class="ctl">
                                <input id="f_permit_date" type="date"/>
                            </div>
                        </div>
                        <div>
                            <label for="f_inspection_date">사용검사일자</label>
                            <div class="ctl">
                                <input id="f_inspection_date" type="date"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="subsection">
                    <h3 class="subsection-title">면적 정보</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 16px;">
                        <div>
                            <label for="f_site_area">대지면적</label>
                            <div class="ctl">
                                <input id="f_site_area" type="number" min="0" step="0.01" inputmode="decimal"
                                       placeholder="예) 1000.50"/>
                                <span class="suffix">m²</span>
                            </div>
                        </div>
                        <div>
                            <label for="f_total_floor_area">연면적</label>
                            <div class="ctl">
                                <input id="f_total_floor_area" type="number" min="0" step="0.01" inputmode="decimal"
                                       placeholder="예) 5000.75"/>
                                <span class="suffix">m²</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="subsection">
                    <h3 class="subsection-title">주차면수</h3>
                    <label for="f_totalStalls">총 주차면수</label>
                    <div id="ctl_total" class="ctl" style="width: 180px;">
                        <input id="f_totalStalls" type="number" min="0" inputmode="numeric" placeholder="예) 120"/>
                        <span class="suffix">면</span>
                    </div>
                    <div id="stallsMsg" class="help" style="margin-top:4px"></div>
                    <div class="parking-stalls-grid">
                        <div class="stall-item">
                            <label>일반</label>
                            <div class="ctl">
                                <input id="f_st_normal" type="number" min="0" inputmode="numeric"/>
                                <span class="suffix">면</span>
                            </div>
                        </div>
                        <div class="stall-item">
                            <label>장애인</label>
                            <div class="ctl">
                                <input id="f_st_dis" type="number" min="0" inputmode="numeric"/>
                                <span class="suffix">면</span>
                            </div>
                        </div>
                        <div class="stall-item">
                            <label>경차</label>
                            <div class="ctl">
                                <input id="f_st_small" type="number" min="0" inputmode="numeric"/>
                                <span class="suffix">면</span>
                            </div>
                        </div>
                        <div class="stall-item">
                            <label>친환경</label>
                            <div class="ctl">
                                <input id="f_st_green" type="number" min="0" inputmode="numeric"/>
                                <span class="suffix">면</span>
                            </div>
                        </div>
                        <div class="stall-item">
                            <label>임산부</label>
                            <div class="ctl">
                                <input id="f_st_preg" type="number" min="0" inputmode="numeric"/>
                                <span class="suffix">면</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 기계식 주차장 섹션 -->
    <section class="card section-card">
        <h2 class="section-header">⚙️ 기계식주차장</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <div class="subsection">
                    <h3 class="subsection-title">기계식주차장형태</h3>
                    <div class="radio-group" id="mech_prklot_type_group" style="margin-bottom: 16px;">
                        <!-- JavaScript로 동적 로드 (PRK_011) -->
                    </div>
                </div>

                <div class="subsection">
                    <h3 class="subsection-title">기계식주차장 작동여부</h3>
                    <div class="radio-group" id="mech_prklot_oper_group" style="margin-bottom: 16px;">
                        <!-- JavaScript로 동적 로드 (PRK_012) -->
                    </div>

                    <div id="mech_prklot_oper_input_wrap" style="display: none; margin-top: 12px;">
                        <label for="f_mech_prklot_oper_value">작동여부 상세</label>
                        <div class="ctl" style="max-width: 400px;">
                            <input id="f_mech_prklot_oper_value" type="text" placeholder="작동여부 상세 정보 입력"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 주차시설형태 · 운영 섹션 -->
    <section class="card section-card">
        <h2 class="section-header">🏢 주차시설형태 · 운영주체 · 급지</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <!-- 전체 규모 -->
                <div class="subsection">
                    <h3 class="subsection-title">전체 규모</h3>
                    <div class="scale-input-group">
                        <input type="number" id="f_total_floors" min="0" placeholder="예) 5" inputmode="numeric"/>
                        <span>층</span>
                        <input type="number" id="f_total_scale_area" min="0" placeholder="예) 3000" inputmode="numeric"/>
                        <span>㎡</span>
                    </div>
                </div>

                <!-- 옥내 -->
                <div class="subsection">
                    <h3 class="subsection-title">옥내</h3>
                    <div class="facility-detail">
                        <div class="facility-row">
                            <span class="facility-label">지상실</span>
                            <div class="facility-inputs">
                                <input type="number" id="f_indoor_ground_floors" min="0" placeholder="층"
                                       inputmode="numeric"/>
                                <span>층 (</span>
                                <input type="number" id="f_indoor_ground_area" min="0" placeholder="㎡"
                                       inputmode="numeric"/>
                                <span>㎡</span>
                                <input type="number" id="f_indoor_ground_spaces" min="0" placeholder="대"
                                       inputmode="numeric"/>
                                <span>대 )</span>
                            </div>
                        </div>
                        <div class="facility-row">
                            <span class="facility-label">기계식</span>
                            <div class="facility-inputs">
                                <input type="number" id="f_indoor_mechanical_floors" min="0" placeholder="층"
                                       inputmode="numeric"/>
                                <span>층 (</span>
                                <input type="number" id="f_indoor_mechanical_area" min="0" placeholder="㎡"
                                       inputmode="numeric"/>
                                <span>㎡</span>
                                <input type="number" id="f_indoor_mechanical_spaces" min="0" placeholder="대"
                                       inputmode="numeric"/>
                                <span>대 )</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 옥외 -->
                <div class="subsection">
                    <h3 class="subsection-title">옥외</h3>
                    <div class="facility-detail">
                        <div class="facility-row">
                            <span class="facility-label">지상실</span>
                            <div class="facility-inputs">
                                <input type="number" id="f_outdoor_ground_floors" min="0" placeholder="층"
                                       inputmode="numeric"/>
                                <span>층 (</span>
                                <input type="number" id="f_outdoor_ground_area" min="0" placeholder="㎡"
                                       inputmode="numeric"/>
                                <span>㎡</span>
                                <input type="number" id="f_outdoor_ground_spaces" min="0" placeholder="대"
                                       inputmode="numeric"/>
                                <span>대 )</span>
                            </div>
                        </div>
                        <div class="facility-row">
                            <span class="facility-label">기계식</span>
                            <div class="facility-inputs">
                                <input type="number" id="f_outdoor_mechanical_floors" min="0" placeholder="층"
                                       inputmode="numeric"/>
                                <span>층 (</span>
                                <input type="number" id="f_outdoor_mechanical_area" min="0" placeholder="㎡"
                                       inputmode="numeric"/>
                                <span>㎡</span>
                                <input type="number" id="f_outdoor_mechanical_spaces" min="0" placeholder="대"
                                       inputmode="numeric"/>
                                <span>대 )</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 운영주체 -->
                <div class="subsection">
                    <h3 class="subsection-title">운영주체</h3>
                    <div class="radio-group" id="operation_entity_group">
                        <label><input type="radio" name="operationEntity" value="시운영" checked/> <span>시운영</span></label>
                        <label><input type="radio" name="operationEntity" value="구(군)운영"/> <span>구(군)운영</span></label>
                        <label><input type="radio" name="operationEntity" value="공단직영"/> <span>공단직영</span></label>
                        <label><input type="radio" name="operationEntity" value="민간위탁" id="operation_private"/> <span>민간위탁</span></label>
                        <label><input type="radio" name="operationEntity" value="민간직영" id="operation_private_direct"/>
                            <span>민간직영</span></label>
                    </div>
                </div>

                <%--<!-- 민간위탁/민간직영 업체명 -->
                <div id="operation_company_wrap" style="display:none;">
                    <label for="f_operation_company">관리기관명</label>
                    <div class="ctl">
                        <input id="f_operation_company" type="text" placeholder="예) ㈜○○파킹" />
                    </div>
                </div>

                <!-- 관리기관 전화번호 -->
                <div>
                    <label for="f_operation_tel">관리기관 전화번호</label>
                    <div class="ctl" style="max-width: 250px;">
                        <input id="f_operation_tel" type="text" placeholder="예) 02-1234-5678" inputmode="tel" />
                    </div>
                </div>--%>

                <!-- 급지 -->
                <div class="subsection">
                    <h3 class="subsection-title">급지</h3>
                    <div class="ctl">
                        <select id="f_grade">
                            <option value="">선택</option>
                            <!-- JavaScript로 동적 로드 -->
                        </select>
                    </div>
                </div>

                <!-- 관리기관 정보 -->
                <div class="subsection">
                    <h3 class="subsection-title">관리기관 정보</h3>
                    <div style="display: grid; gap: 16px;">
                        <div>
                            <label for="f_management_agency">관리기관명</label>
                            <div class="ctl">
                                <input id="f_management_agency" type="text" placeholder="관리기관명 입력"/>
                            </div>
                        </div>
                        <div>
                            <label for="f_management_tel">관리기관 전화번호</label>
                            <div class="ctl" style="max-width: 250px;">
                                <input id="f_management_tel" type="text" placeholder="예) 02-1234-5678" inputmode="tel" value="<c:out value='${parking.mgrOrgTelNo}'/>"/>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 부제시행여부 -->
                <div>
                    <label for="f_oddEven">부제시행여부</label>
                    <div class="ctl" style="max-width: 200px;">
                        <select id="f_oddEven">
                            <!-- JavaScript로 동적 로드 -->
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 운영시간 섹션 -->
    <section class="card section-card">
        <h2 class="section-header">🕐 운영시간</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <!-- 평일 -->
                <div class="operation-day-block">
                    <h3 class="operation-day-title">평일</h3>
                    <div class="radio-group" id="weekday_operation_group">
                        <!-- JavaScript로 동적 생성 -->
                    </div>

                    <div id="weekday_time_wrap" class="time-inputs-wrapper weekday-time" style="display: none;">
                        <div class="highlight-input-area">
                            <div class="time-input-group">
                                <span class="time-label">운영시간:</span>
                                <input type="number" id="weekday_start_hour" min="0" max="23" placeholder="시"
                                       class="time-input"/>
                                <span class="time-unit">시</span>
                                <input type="number" id="weekday_start_min" min="0" max="59" placeholder="분"
                                       class="time-input"/>
                                <span class="time-unit">분</span>
                                <span class="time-separator">~</span>
                                <input type="number" id="weekday_end_hour" min="0" max="23" placeholder="시"
                                       class="time-input"/>
                                <span class="time-unit">시</span>
                                <input type="number" id="weekday_end_min" min="0" max="59" placeholder="분"
                                       class="time-input"/>
                                <span class="time-unit">분</span>
                            </div>
                            <div class="input-guide">평일 운영시간을 입력해주세요 (24시간 형식)</div>
                        </div>
                    </div>
                </div>

                <!-- 토요일 -->
                <div class="operation-day-block">
                    <h3 class="operation-day-title">토요일</h3>
                    <div class="radio-group" id="saturday_operation_group">
                        <!-- JavaScript로 동적 생성 -->
                    </div>

                    <div id="saturday_time_wrap" class="time-inputs-wrapper saturday-time" style="display: none;">
                        <div class="highlight-input-area">
                            <div class="time-input-group">
                                <span class="time-label">운영시간:</span>
                                <input type="number" id="saturday_start_hour" min="0" max="23" placeholder="시"
                                       class="time-input"/>
                                <span class="time-unit">시</span>
                                <input type="number" id="saturday_start_min" min="0" max="59" placeholder="분"
                                       class="time-input"/>
                                <span class="time-unit">분</span>
                                <span class="time-separator">~</span>
                                <input type="number" id="saturday_end_hour" min="0" max="23" placeholder="시"
                                       class="time-input"/>
                                <span class="time-unit">시</span>
                                <input type="number" id="saturday_end_min" min="0" max="59" placeholder="분"
                                       class="time-input"/>
                                <span class="time-unit">분</span>
                            </div>
                            <div class="input-guide">토요일 운영시간을 입력해주세요 (24시간 형식)</div>
                        </div>
                    </div>
                </div>

                <!-- 공휴일 -->
                <div class="operation-day-block">
                    <h3 class="operation-day-title">공휴일</h3>
                    <div class="radio-group" id="holiday_operation_group">
                        <!-- JavaScript로 동적 생성 -->
                    </div>

                    <div id="holiday_time_wrap" class="time-inputs-wrapper holiday-time" style="display: none;">
                        <div class="highlight-input-area">
                            <div class="time-input-group">
                                <span class="time-label">운영시간:</span>
                                <input type="number" id="holiday_start_hour" min="0" max="23" placeholder="시"
                                       class="time-input"/>
                                <span class="time-unit">시</span>
                                <input type="number" id="holiday_start_min" min="0" max="59" placeholder="분"
                                       class="time-input"/>
                                <span class="time-unit">분</span>
                                <span class="time-separator">~</span>
                                <input type="number" id="holiday_end_hour" min="0" max="23" placeholder="시"
                                       class="time-input"/>
                                <span class="time-unit">시</span>
                                <input type="number" id="holiday_end_min" min="0" max="59" placeholder="분"
                                       class="time-input"/>
                                <span class="time-unit">분</span>
                            </div>
                            <div class="input-guide">공휴일 운영시간을 입력해주세요 (24시간 형식)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 요금수준 섹션 -->
    <section class="card section-card">
        <h2 class="section-header">💰 요금수준</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <div id="res_fee_wrap" class="subsection">
                    <h3 class="subsection-title">거주자우선주차장 요금</h3>
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

                <div id="normal_fee_wrap" class="subsection">
                    <h3 class="subsection-title">일반부설주차장 요금</h3>
                    <div class="fee-group">
                        <div class="fee-item">
                            <label for="f_fee_first30">최초 30분</label>
                            <div class="ctl"><input id="f_fee_first30" type="text" inputmode="numeric"
                                                    placeholder="예) 1000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_fee_per10">매 10분</label>
                            <div class="ctl"><input id="f_day_fee_per10" type="text" inputmode="numeric"
                                                    placeholder="예) 300"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_fee_per60">1시간</label>
                            <div class="ctl"><input id="f_day_fee_per60" type="text" inputmode="numeric"
                                                    placeholder="예) 2000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_fee_daily">전일(일)</label>
                            <div class="ctl"><input id="f_fee_daily" type="text" inputmode="numeric"
                                                    placeholder="예) 10000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_fee_monthly">월정기권</label>
                            <div class="ctl"><input id="f_fee_monthly" type="text" inputmode="numeric"
                                                    placeholder="예) 120000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_fee_halfyear">반기권</label>
                            <div class="ctl"><input id="f_fee_halfyear" type="text" inputmode="numeric"
                                                    placeholder="예) 600000"/><span class="suffix">원</span></div>
                        </div>
                    </div>
                </div>

                <!-- 요금지불방식 -->
                <div id="fee_pay_wrap" class="subsection">
                    <h3 class="subsection-title">요금 지불방식</h3>
                    <div class="check-group" id="pay_group">
                        <!-- JavaScript로 동적 생성 -->
                    </div>
                </div>

                <!-- 요금정산방식 -->
                <div id="fee_settle_wrap" class="subsection">
                    <h3 class="subsection-title">요금 정산방식</h3>
                    <div id="settle_group" class="check-group">
                        <!-- JavaScript로 동적 생성 -->
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 주차관리 시설 정보 섹션 -->
    <section class="card section-card">
        <h2 class="section-header">🛠️ 주차관리 시설</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <!-- 주차장표지판 -->
                <div class="subsection">
                    <h3 class="subsection-title">주차장표지판 유무</h3>
                    <div class="radio-group" id="parking_sign_group">
                        <label><input type="radio" name="parkingSign" value="Y" id="sign_yes"/> <span>있음</span></label>
                        <label><input type="radio" name="parkingSign" value="N" id="sign_no" checked/>
                            <span>없음</span></label>
                    </div>
                </div>

                <div id="sign_photo_wrap" style="display:none;">
                    <label>표지판 사진</label>
                    <div class="photo-upload-zone">
                        <input id="f_sign_photo_lib" type="file" accept="image/*,image/heic,image/heif"
                               style="display:none"/>
                        <input id="f_sign_photo_cam" type="file" accept="image/*" capture="environment"
                               style="display:none"/>
                        <div class="file-upload-buttons">
                            <button type="button" class="btn light" id="btnSignPhotoLibrary">📁 사진첩</button>
                            <button type="button" class="btn ghost" id="btnSignPhotoCamera">📷 촬영</button>
                            <button type="button" class="btn ghost" id="btnClearSignPhoto">🗑️ 초기화</button>
                        </div>
                        <img id="sign_preview" class="thumb" alt="표지판 사진" style="display:none;"/>
                    </div>
                </div>

                <!-- 발권기 -->
                <div class="subsection">
                    <h3 class="subsection-title">발권기 유무</h3>
                    <div class="radio-group" id="ticket_machine_group">
                        <label><input type="radio" name="ticketMachine" value="Y" id="ticket_yes"/>
                            <span>있음</span></label>
                        <label><input type="radio" name="ticketMachine" value="N" id="ticket_no" checked/>
                            <span>없음</span></label>
                    </div>
                </div>

                <div id="ticket_photo_wrap" style="display:none;">
                    <label>발권기 사진</label>
                    <div class="photo-upload-zone">
                        <input id="f_ticket_photo_lib" type="file" accept="image/*,image/heic,image/heif"
                               style="display:none"/>
                        <input id="f_ticket_photo_cam" type="file" accept="image/*" capture="environment"
                               style="display:none"/>
                        <div class="file-upload-buttons">
                            <button type="button" class="btn light" id="btnTicketPhotoLibrary">📁 사진첩</button>
                            <button type="button" class="btn ghost" id="btnTicketPhotoCamera">📷 촬영</button>
                            <button type="button" class="btn ghost" id="btnClearTicketPhoto">🗑️ 초기화</button>
                        </div>
                        <img id="ticket_preview" class="thumb" alt="발권기 사진" style="display:none;"/>
                    </div>
                </div>

                <!-- 차단기 -->
                <div class="subsection">
                    <h3 class="subsection-title">차단기 유무</h3>
                    <div class="radio-group" id="barrier_group">
                        <label><input type="radio" name="barrier" value="Y" id="barrier_yes"/> <span>있음</span></label>
                        <label><input type="radio" name="barrier" value="N" id="barrier_no" checked/>
                            <span>없음</span></label>
                    </div>
                </div>

                <div id="barrier_photo_wrap" style="display:none;">
                    <label>차단기 사진</label>
                    <div class="photo-upload-zone">
                        <input id="f_barrier_photo_lib" type="file" accept="image/*,image/heic,image/heif"
                               style="display:none"/>
                        <input id="f_barrier_photo_cam" type="file" accept="image/*" capture="environment"
                               style="display:none"/>
                        <div class="file-upload-buttons">
                            <button type="button" class="btn light" id="btnBarrierPhotoLibrary">📁 사진첩</button>
                            <button type="button" class="btn ghost" id="btnBarrierPhotoCamera">📷 촬영</button>
                            <button type="button" class="btn ghost" id="btnClearBarrierPhoto">🗑️ 초기화</button>
                        </div>
                        <img id="barrier_preview" class="thumb" alt="차단기 사진" style="display:none;"/>
                    </div>
                </div>

                <!-- 차량인식종류 -->
                <div id="vehicle_recognition_wrap" style="display:none;">
                    <h3 class="subsection-title">차량인식종류</h3>
                    <div class="radio-group" id="vehicle_recognition_group">
                        <!-- JavaScript로 동적 로드 (PRK_008) -->
                    </div>
                </div>

                <!-- 출차알람 -->
                <div class="subsection">
                    <h3 class="subsection-title">출차알람 유무</h3>
                    <div class="radio-group" id="alarm_group">
                        <label><input type="radio" name="alarm" value="Y" id="alarm_yes"/> <span>있음</span></label>
                        <label><input type="radio" name="alarm" value="N" id="alarm_no" checked/>
                            <span>없음</span></label>
                    </div>
                </div>

                <div id="exit_alarm_photo_wrap" style="display:none;">
                    <label>출차알람 사진</label>
                    <div class="photo-upload-zone">
                        <input id="f_exit_alarm_photo_lib" type="file" accept="image/*,image/heic,image/heif"
                               style="display:none"/>
                        <input id="f_exit_alarm_photo_cam" type="file" accept="image/*" capture="environment"
                               style="display:none"/>
                        <div class="file-upload-buttons">
                            <button type="button" class="btn light" id="btnExitAlarmPhotoLibrary">📁 사진첩</button>
                            <button type="button" class="btn ghost" id="btnExitAlarmPhotoCamera">📷 촬영</button>
                            <button type="button" class="btn ghost" id="btnClearExitAlarmPhoto">🗑️ 초기화</button>
                        </div>
                        <img id="exit_alarm_preview" class="thumb" alt="출차알람 사진" style="display:none;"/>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 주차 첨두시간 섹션 -->
    <section class="card section-card">
        <h2 class="section-header">주차 첨두시간</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <!-- 주간 -->
                <div class="subsection">
                    <h3 class="subsection-title">주간 (07시 ~ 20시)</h3>
                    <div class="peak-time-group">
                        <span class="peak-label">첨두시간대:</span>
                        <div class="ctl">
                            <input id="f_peak_day_start" type="number" min="7" max="20" placeholder="07"
                                   inputmode="numeric"/>
                            <span class="suffix">시</span>
                        </div>
                        <span>~</span>
                        <div class="ctl">
                            <input id="f_peak_day_end" type="number" min="7" max="20" placeholder="20"
                                   inputmode="numeric"/>
                            <span class="suffix">시</span>
                        </div>
                        <span class="peak-label">주차대수:</span>
                        <div class="ctl">
                            <input id="f_peak_day_count" type="number" min="0" placeholder="예) 80" inputmode="numeric"/>
                            <span class="suffix">대</span>
                        </div>
                    </div>
                </div>

                <!-- 야간 -->
                <div class="subsection">
                    <h3 class="subsection-title">야간 (20시 ~ 익일 07시)</h3>
                    <div class="peak-time-group">
                        <span class="peak-label">첨두시간대:</span>
                        <div class="ctl">
                            <input id="f_peak_night_start" type="number" min="20" max="23" placeholder="20"
                                   inputmode="numeric"/>
                            <span class="suffix">시</span>
                        </div>
                        <span>~</span>
                        <div class="ctl">
                            <input id="f_peak_night_end" type="number" min="0" max="7" placeholder="07"
                                   inputmode="numeric"/>
                            <span class="suffix">시</span>
                        </div>
                        <span class="peak-label">주차대수:</span>
                        <div class="ctl">
                            <input id="f_peak_night_count" type="number" min="0" placeholder="예) 100"
                                   inputmode="numeric"/>
                            <span class="suffix">대</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 위치 (주차장입구) 섹션 -->
    <section class="card section-card">
        <h2 class="section-header">주차장 입구 위치</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <label>주차장 입구 사진</label>
                <div class="photo-upload-zone">
                    <input id="f_entrance_photo_lib" type="file" accept="image/*,image/heic,image/heif"
                           style="display:none"/>
                    <input id="f_entrance_photo_cam" type="file" accept="image/*" capture="environment"
                           style="display:none"/>
                    <div class="file-upload-buttons">
                        <button type="button" class="btn light" id="btnEntrancePhotoLibrary">📁 사진첩</button>
                        <button type="button" class="btn ghost" id="btnEntrancePhotoCamera">📷 촬영</button>
                        <button type="button" class="btn ghost" id="btnClearEntrancePhoto">🗑️ 초기화</button>
                    </div>
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

    <!-- 안전관리실태조사 섹션 -->
    <section class="card section-card">
        <h2 class="section-header">안전관리실태조사</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <!-- 2층 이상 건축물 -->
                <div class="subsection">
                    <h3 class="subsection-title">2층 이상 건축물 주차장여부</h3>
                    <div class="radio-group" id="elevator_group">
                        <label><input type="radio" name="buildingFloor" value="1층" checked/> <span>1층</span></label>
                        <label><input type="radio" name="buildingFloor" value="2층이상"/> <span>2층 이상</span></label>
                    </div>
                </div>

                <!-- 추락방지시설 -->
                <div id="fall_prevention_wrap" style="display:none;" class="subsection">
                    <h3 class="subsection-title">추락방지시설 유무</h3>
                    <div class="radio-group" id="fall_prevention_group">
                        <label><input type="radio" name="fallPrevention" value="Y"/> <span>있음</span></label>
                        <label><input type="radio" name="fallPrevention" value="N"/> <span>없음</span></label>
                    </div>
                </div>

                <!-- 경사 여부 -->
                <div class="subsection">
                    <h3 class="subsection-title">경사 여부</h3>
                    <div class="radio-group" id="slope_group">
                        <label><input type="radio" name="slope" value="Y" id="slope_yes"/> <span>있음</span></label>
                        <label><input type="radio" name="slope" value="N" id="slope_no" checked/>
                            <span>없음</span></label>
                    </div>
                </div>

                <!-- 안전시설 -->
                <div class="subsection">
                    <h3 class="subsection-title">안전시설</h3>
                    <div class="check-group" id="safety_group">
                        <label><input type="checkbox" name="safetyFacility" value="Y" id="antislp_facility_chk"/> <span>미끄럼 방지시설</span></label>
                        <label><input type="checkbox" name="safetyFacility" value="Y" id="slp_guide_sign_chk"/> <span>미끄럼 주의 안내표지판</span></label>
                    </div>
                </div>

                <!-- 보행안전시설 -->
                <div id="pedestrian_safety_wrap" class="pedestrian-safety-section"
                     style="opacity: 0.5; pointer-events: none;">
                    <h3 class="subsection-title">보행안전시설 <span class="help">(총 주차면수 400면 이상인 경우만 입력 가능)</span></h3>
                    <div class="pedestrian-safety-grid">
                        <div class="safety-item">
                            <span>과속방지턱</span>
                            <div class="ctl">
                                <input id="f_speed_bump_count" type="number" min="0" placeholder="0" inputmode="numeric"
                                       disabled/>
                                <span class="suffix">개</span>
                            </div>
                        </div>
                        <div class="safety-item">
                            <span>원산차선</span>
                            <div class="ctl">
                                <input id="f_crosswalk_count" type="number" min="0" placeholder="0" inputmode="numeric"
                                       disabled/>
                                <span class="suffix">개</span>
                            </div>
                        </div>
                        <div class="safety-item">
                            <span>횡단보도</span>
                            <div class="ctl">
                                <input id="f_pedestrian_crossing_count" type="number" min="0" placeholder="0"
                                       inputmode="numeric" disabled/>
                                <span class="suffix">개</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 기계식주차장 안전관리실태조사 섹션 -->
    <section class="card section-card">
        <h2 class="section-header">기계식주차장 안전관리실태조사</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <div class="safety-check-grid">
                    <div class="subsection">
                        <h3 class="subsection-title">안내문 유무</h3>
                        <div class="radio-group" id="announcement_group">
                            <label><input type="radio" name="announcement" value="Y" <c:if test="${parking.guidDocYn eq 'Y'}">checked</c:if>/> <span>있음</span></label>
                            <label><input type="radio" name="announcement" value="N" <c:if test="${parking.guidDocYn ne 'Y'}">checked</c:if>/> <span>없음</span></label>
                        </div>
                    </div>

                    <div class="subsection">
                        <h3 class="subsection-title">안전검사 유무</h3>
                        <div class="radio-group" id="safety_check_group">
                            <label><input type="radio" name="safetyCheck" value="Y"/> <span>있음</span></label>
                            <label><input type="radio" name="safetyCheck" value="N" checked/> <span>없음</span></label>
                        </div>
                    </div>

                    <div class="subsection">
                        <h3 class="subsection-title">관리인 유무</h3>
                        <div class="radio-group" id="manager_group">
                            <label><input type="radio" name="manager" value="Y"/> <span>있음</span></label>
                            <label><input type="radio" name="manager" value="N" checked/> <span>없음</span></label>
                        </div>
                    </div>

                    <div class="subsection">
                        <h3 class="subsection-title">관리자 유무</h3>
                        <div class="radio-group" id="admin_group">
                            <label><input type="radio" name="admin" value="Y"/> <span>있음</span></label>
                            <label><input type="radio" name="admin" value="N" checked/> <span>없음</span></label>
                        </div>
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
                    <textarea id="f_partclr_matter" rows="8" placeholder="주차장 관련 특이사항을 입력하세요"></textarea>
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
<script src="${pageContext.request.contextPath}/static/js/page/parking/buildparking.js"></script>
</body>
</html>
