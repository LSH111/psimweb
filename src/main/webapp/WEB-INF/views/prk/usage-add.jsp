<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/usage-add.css"/>
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

    <!-- 🔥 사진 & 좌표 섹션 추가 -->
    <section class="card">
        <h2>현장 사진 & 좌표</h2>
        <div class="grid">
            <div style="grid-column:1/-1">
                <label>사진 업로드</label>
                <div class="photo-upload-zone" style="border:2px dashed #cbd5e1; border-radius:8px; padding:20px; text-align:center; background:#f8fafc;">
                    <input id="f_photo_lib" type="file" accept="image/*,image/heic,image/heif" style="display:none" />
                    <input id="f_photo_cam" type="file" accept="image/*" capture="environment" style="display:none" />

                    <div class="file-upload-buttons" style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:16px;">
                        <button type="button" class="btn light" id="btnPickFromLibrary">사진첩에서 선택</button>
                        <button type="button" class="btn ghost" id="btnTakePhoto">카메라 촬영</button>
                        <button type="button" class="btn" id="btnUseGeolocation">기기 위치로 좌표</button>
                        <button type="button" class="btn ghost" id="btnClearPhoto">초기화</button>
                    </div>

                    <!-- 업로드 진행률 표시 -->
                    <div id="upload-progress-area" class="upload-progress-container" style="display:none; background:white; border-radius:8px; padding:20px; margin-top:16px; text-align:left;">
                        <div class="upload-header" style="margin-bottom:16px;">
                            <h3 class="upload-title" style="font-size:1.1rem; font-weight:600; color:#1e293b;">첨부파일 업로드</h3>
                        </div>

                        <div class="upload-summary" style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:0.9rem; color:#64748b;">
                            <span class="upload-status">0개 / 1개</span>
                            <span class="upload-size">0MB / 0MB</span>
                            <span class="upload-percent">0% 남음</span>
                        </div>

                        <div class="progress-bar-container" style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                            <div class="progress-bar" style="flex:1; height:24px; background:#e2e8f0; border-radius:12px; overflow:hidden; position:relative;">
                                <div class="progress-fill" id="progress-fill" style="height:100%; background:linear-gradient(90deg, #3b82f6, #8b5cf6); transition:width 0.3s;"></div>
                            </div>
                            <span class="progress-text" id="progress-text" style="font-size:0.9rem; font-weight:600; color:#1e293b; min-width:45px; text-align:right;">0%</span>
                        </div>

                        <div class="file-list">
                            <div class="file-item" id="upload-file-item" style="display:none; padding:12px; background:#f8fafc; border-radius:8px; margin-bottom:12px;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div class="file-icon" style="font-size:2rem;">📁</div>
                                    <div class="file-info" style="flex:1;">
                                        <div class="file-name" id="file-name" style="font-size:0.9rem; font-weight:600; color:#1e293b; margin-bottom:4px;">파일명.jpg</div>
                                        <div class="file-size-progress">
                                            <div class="file-progress-bar" style="height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden; margin-bottom:4px;">
                                                <div class="file-progress-fill" id="file-progress-fill" style="height:100%; background:#3b82f6; transition:width 0.3s;"></div>
                                            </div>
                                            <span class="file-size" id="file-size" style="font-size:0.8rem; color:#64748b;">0MB / 0MB</span>
                                        </div>
                                    </div>
                                    <div class="file-status" id="file-status" style="font-size:0.85rem; color:#8b5cf6; font-weight:600;">전송중</div>
                                </div>
                            </div>
                        </div>

                        <div class="upload-actions" style="display:flex; gap:8px; justify-content:flex-end; margin-top:16px;">
                            <button type="button" class="btn ghost" id="btn-upload-cancel">취소</button>
                            <button type="button" class="btn" id="btn-upload-complete" style="display:none;">완료</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 사진 미리보기 -->
            <div style="grid-column:1/-1">
                <img id="preview" class="thumb" alt="사진 미리보기" style="display:none; max-width:100%; border-radius:8px; border:1px solid #e2e8f0;" />
            </div>

            <!-- 위도/경도 -->
            <div>
                <label for="f_lat">위도</label>
                <div class="ctl">
                    <input id="f_lat" class="mono" inputmode="decimal" placeholder="37.5665" />
                </div>
            </div>
            <div>
                <label for="f_lng">경도</label>
                <div class="ctl">
                    <input id="f_lng" class="mono" inputmode="decimal" placeholder="126.9780" />
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