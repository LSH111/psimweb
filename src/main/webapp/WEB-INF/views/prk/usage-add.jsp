<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/usage-add.css"/>
<script src="${pageContext.request.contextPath}/static/js/usage-add.js"></script>
<!-- usage-status-list.jsp에 포함되므로 html, head, body 태그 제거 -->
<div class="wrap">
    <header class="card head">
        <div class="title">주차 이용 현황 등록</div>
        <span class="actions" style="margin-left:auto">
            <button class="btn" id="btnSaveTop">저장</button>
        </span>
    </header>

    <!-- 주차장 조사 -->
    <section class="card">
        <h2>수급 실태 조사</h2>
        <div class="grid">
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
                    <select id="f_sigungu">
                        <option value="">선택</option>
                    </select>
                </div>
            </div>

            <div>
                <label for="f_emd">읍면동</label>
                <div class="ctl">
                    <select id="f_emd">
                        <option value="">선택</option>
                    </select>
                </div>
            </div>

            <div>
                <label for="f_ri">리</label>
                <div class="ctl">
                    <input id="f_ri" type="text" placeholder="-리-"/>
                </div>
            </div>

            <div style="grid-column:1/-1">
                <button type="button" class="btn light" id="btnFindAddr">주소찾기</button>
            </div>
        </div>
    </section>

    <!-- 🔥 사진 & 좌표 섹션 - multiple 속성 추가 -->
    <section class="card">
        <h2>현장 사진 & 좌표</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <label>사진 업로드 (여러 장 가능)</label>
                <div class="photo-upload-zone" style="border:2px dashed #cbd5e1; border-radius:8px; padding:20px; text-align:center; background:#f8fafc;">
                    <input id="f_photo_lib" type="file" accept="image/*,image/heic,image/heif" multiple style="display:none" />
                    <input id="f_photo_cam" type="file" accept="image/*" capture="environment" multiple style="display:none" />

                    <div class="file-upload-buttons" style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:16px;">
                        <button type="button" class="btn light" id="btnPickFromLibrary">사진첩에서 선택</button>
                        <button type="button" class="btn ghost" id="btnTakePhoto">카메라 촬영</button>
                        <button type="button" class="btn" id="btnUseGeolocation">기기 위치로 좌표</button>
                        <button type="button" class="btn ghost" id="btnClearPhoto">초기화</button>
                    </div>

                    <!-- 선택된 파일 목록 표시 -->
                    <div id="selected-files-list" style="display:none; margin-top:16px; text-align:left;">
                        <h4 style="font-size:0.9rem; font-weight:600; color:#1e293b; margin-bottom:12px;">선택된 파일 (<span id="file-count">0</span>개)</h4>
                        <div id="files-container" style="display:flex; flex-direction:column; gap:8px;"></div>
                    </div>
                </div>
            </div>

            <!-- 사진 미리보기 (여러 장) -->
            <div id="preview-container" style="grid-column:1/-1; display:none;">
                <h4 style="font-size:0.9rem; font-weight:600; color:#1e293b; margin-bottom:12px;">미리보기</h4>
                <div id="preview-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:12px;"></div>
            </div>

            <!-- 위도/경도 -->
            <div>
                <label for="f_lat">위도</label>
                <div class="ctl">
                    <input id="f_lat" class="mono" inputmode="decimal" placeholder="37.5665" readonly />
                </div>
            </div>
            <div>
                <label for="f_lng">경도</label>
                <div class="ctl">
                    <input id="f_lng" class="mono" inputmode="decimal" placeholder="126.9780" readonly />
                </div>
            </div>
        </div>
    </section>

    <!-- 조사일자 -->
    <section class="card">
        <h2>조사일자</h2>
        <div class="grid">
            <div>
                <label for="f_surveyDate">조사일</label>
                <div class="ctl">
                    <input id="f_surveyDate" type="date"/>
                </div>
            </div>
        </div>
    </section>

    <!-- 조사시간대 -->
    <section class="card">
        <h2>조사시간대</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <div class="time-range-inputs">
                    <div class="time-input-group">
                        <input type="number" id="f_startHour" min="0" max="23" placeholder="시" class="time-input"/>
                        <span class="time-unit">시</span>
                        <input type="number" id="f_startMin" min="0" max="59" placeholder="분" class="time-input"/>
                        <span class="time-unit">분</span>
                        <span class="time-separator">~</span>
                        <input type="number" id="f_endHour" min="0" max="23" placeholder="시" class="time-input"/>
                        <span class="time-unit">시</span>
                        <input type="number" id="f_endMin" min="0" max="59" placeholder="분" class="time-input"/>
                        <span class="time-unit">분</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 차종 -->
    <section class="card">
        <h2>차종</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <div class="radio-group">
                    <label><input type="radio" name="vehicleType" value="1" checked/>
                        <span>승용(세단, SUV 등)</span></label>
                    <label><input type="radio" name="vehicleType" value="2"/>
                        <span>승합(버스, 미니밴 등)</span></label>
                    <label><input type="radio" name="vehicleType" value="3"/> <span>화물</span></label>
                    <label><input type="radio" name="vehicleType" value="4"/> <span>특수(견인기 등)</span></label>
                </div>
            </div>
        </div>
    </section>

    <!-- 적/불법 -->
    <section class="card">
        <h2>적/불법</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <div class="radio-group">
                    <label>
                        <input type="radio" name="lawGbn" value="1" checked/>
                        <span>적법</span>
                    </label>
                    <label>
                        <input type="radio" name="lawGbn" value="2"/>
                        <span>불법</span>
                    </label>
                </div>
            </div>
        </div>
    </section>

    <!-- 차량번호 -->
    <section class="card">
        <h2>차량번호</h2>
        <div class="grid">
            <div>
                <label for="f_plateNumber">차량번호</label>
                <div class="ctl">
                    <input id="f_plateNumber" type="text" placeholder="예) 123가4567"/>
                </div>
            </div>
        </div>
    </section>

    <!-- 조사원 -->
    <section class="card">
        <h2>조사원</h2>
        <div class="grid row-1c">
            <div>
                <label for="f_surveyorName">성명</label>
                <div class="ctl">
                    <input id="f_surveyorName" type="text" placeholder="조사원 이름"/>
                </div>
            </div>

            <div>
                <label for="f_surveyorContact">연락처</label>
                <div class="ctl">
                    <input id="f_surveyorContact" type="text" placeholder="예) 010-1234-5678" inputmode="tel"/>
                </div>
            </div>
        </div>
    </section>

    <!-- 비고 -->
    <section class="card">
        <h2>비고</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <label for="f_remarks">특이사항</label>
                <div class="ctl">
                    <textarea id="f_remarks" rows="6" placeholder="특이사항을 입력하세요"></textarea>
                </div>
            </div>
        </div>
    </section>

    <!-- 저장 버튼 -->
    <section class="card">
        <div class="actions" style="justify-content: center;">
            <button class="btn btn-save" id="btnSave">저장하기</button>
        </div>
    </section>
</div>

<!-- 주소찾기 레이어 -->
<div id="postcodeLayer" role="dialog" aria-modal="true" aria-label="주소 검색" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999;">
    <div id="postcodeWrap" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:90%; max-width:500px; background:white; border-radius:12px; padding:20px;">
        <button id="postcodeClose" class="btn light" type="button" style="margin-bottom:10px;">닫기</button>
        <div id="postcodeContainer"></div>
    </div>
</div>