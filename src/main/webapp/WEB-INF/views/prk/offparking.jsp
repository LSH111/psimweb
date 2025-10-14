<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>노상주차장 상세</title>

    <!-- 페이지 전용 CSS -->
    <link rel="stylesheet" href="<c:url value='/static/css/pages/offparking.css'/>"/>

    <!-- 외부 라이브러리 (EXIF / 다음 우편번호) -->
    <script src="https://cdn.jsdelivr.net/npm/exifr@7/dist/full.umd.js"></script>
    <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
</head>
<body>
<div class="wrap">
    <header class="card head">
        <div class="title" id="v_name">노상주차장 상세</div>
        <span class="badge">노상</span>
        <span class="muted mono" id="v_id">관리번호</span>
        <span class="muted" id="v_addr"></span>
        <span class="actions" style="margin-left:auto">
        <button class="btn" onclick="window.print()">인쇄</button>
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
            <!-- 총 주차면수 + 세부 -->
            <div style="grid-column:1/-1">
                <label for="f_totalStalls">총 주차면수</label>
                <div id="ctl_total" class="ctl">
                    <input id="f_totalStalls" type="number" min="0" inputmode="numeric" style="width:90px; margin-left:6px" placeholder="예) 120" />
                    <span class="suffix">면</span>
                </div>

                <!-- 삭제 : 자동합계 체크박스 -->
                <!--<div class="check-group" style="margin:8px 0">
                    <label><input type="checkbox" id="autoSum" checked /> <span>세부 합계로 총면수 자동 반영</span></label>
                </div>-->

                <div id="stallsMsg" class="help" style="margin-top:4px"></div>
                <div class="check-group" style="margin-top:8px">
                    <label><span>일반</span><input id="f_st_normal"   type="number" min="0" inputmode="numeric" style="width:90px; margin-left:6px" /><span class="suffix">면</span></label>
                    <label><span>장애인</span><input id="f_st_dis"   type="number" min="0" inputmode="numeric" style="width:90px; margin-left:6px" /><span class="suffix">면</span></label>
                    <label><span>경차</span>  <input id="f_st_small" type="number" min="0" inputmode="numeric" style="width:90px; margin-left:6px" /><span class="suffix">면</span></label>
                    <label><span>친환경</span><input id="f_st_green" type="number" min="0" inputmode="numeric" style="width:90px; margin-left:6px" /><span class="suffix">면</span></label>
                    <label><span>임산부</span><input id="f_st_preg"  type="number" min="0" inputmode="numeric" style="width:90px; margin-left:6px" /><span class="suffix">면</span></label>
                </div>
            </div>

            <!-- 운영주체 -->
            <div style="grid-column:1/-1">
                <label>운영주체</label>
                <div class="radio-group" id="own_group">
                    <label><input type="radio" name="own" value="시운영" checked /> <span>시운영</span></label>
                    <label><input type="radio" name="own" value="구(군)운영" /> <span>구(군)운영</span></label>
                    <label><input type="radio" name="own" value="공단위탁" /> <span>공단위탁</span></label>
                    <label><input type="radio" name="own" value="민간위탁" id="own_private" /> <span>민간위탁</span></label>
                </div>
            </div>
            <div id="own_company_wrap" hidden>
                <label for="f_own_company">민간위탁 업체명</label>
                <div class="ctl"><input id="f_own_company" placeholder="예) ㈜○○파킹" /></div>
            </div>

            <!-- 관리기관 -->
            <div>
                <label for="f_mgr_name">관리기관명</label>
                <div class="ctl"><input id="f_mgr_name" placeholder="예) 마포구청 교통행정과" /></div>
            </div>
            <div>
                <label for="f_mgr_tel">관리기관 전화번호</label>
                <div class="ctl"><input id="f_mgr_tel" placeholder="예) 02-123-4567" inputmode="tel" /></div>
            </div>

            <!-- 부제 시행 여부 -->
            <div>
                <label for="f_oddEven">부제 시행 여부</label>
                <div class="ctl">
                    <select id="f_oddEven">
                        <option value="미시행">미시행</option>
                        <option value="2부제">2부제</option>
                        <option value="5부제">5부제</option>
                        <option value="10부제">10부제</option>
                        <option value="승용차요일제">승용차요일제</option>
                    </select>
                </div>
            </div>

            <!-- 시간대 -->
            <div style="grid-column:1/-1">
                <label>운영 시간대</label>
                <div class="check-group">
                    <label><input type="checkbox" id="chk_day" /> <span>주간</span></label>
                    <label><input type="checkbox" id="chk_night" /> <span>야간</span></label>
                </div>
            </div>

            <!-- 운영방식 -->
            <div style="grid-column:1/-1">
                <label>주차장 운영방식</label>
                <div class="radio-group" id="op_group">
                    <label><input type="radio" name="opType" value="일반노상주차장" checked /> <span>일반노상주차장</span></label>
                    <label><input type="radio" name="opType" value="거주자우선주차장" /> <span>거주자우선주차장</span></label>
                    <label><input type="radio" name="opType" value="일반노상주차장+거주자우선주차장" /> <span>일반노상+거주자우선</span></label>
                </div>
            </div>

            <!-- 주간 세부 -->
            <div id="day_detail_wrap" class="grid row-1c" hidden style="grid-column:1/-1">
                <div>
                    <label for="f_day_grade">주간 급지</label>
                    <div class="ctl">
                        <select id="f_day_grade">
                            <option value="">선택</option>
                            <option>1급지</option><option>2급지</option><option>3급지</option>
                            <option>4급지</option><option>5급지</option>
                            <option>미분류</option><option>기타</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- 요금부과여부 : 추가 -->
            <div id="fee_charge_wrap" class="fee-block card" style="grid-column:1/-1">
                <h2 class="fee-title">요금 부과여부</h2>
                <div class="grid row-1c">
                    <div>
                        <label for="f_day_feeType">주간 요금 부과여부</label>
                        <div class="ctl">
                            <select id="f_day_feeType">
                                <option value="">선택</option>
                                <option>유료</option>
                                <option>무료</option>
                                <option>유료+무료</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 운영 · 요금 · 주차면수 카드 내부의 grid 영역에서 -->
            <div id="fee_level_wrap" class="fee-level card" style="grid-column:1/-1">
                <h2 class="fee-title">요금수준</h2>

                <!-- (A) 거주자우선주차장 요금 -->
                <div id="res_fee_wrap" class="grid row-1c" hidden>
                    <h3 class="help" style="margin:.2rem 0">거주자우선주차장 요금(원)</h3>
                    <div class="fee-group">
                        <div class="fee-item">
                            <label for="f_res_all">전일</label>
                            <div class="ctl"><input id="f_res_all" type="number" min="0" inputmode="numeric" placeholder="예) 5000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_res_day">주간</label>
                            <div class="ctl"><input id="f_res_day" type="number" min="0" inputmode="numeric" placeholder="예) 3000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_res_full">상근</label>
                            <div class="ctl"><input id="f_res_full" type="number" min="0" inputmode="numeric" placeholder="예) 4000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_res_night">야간</label>
                            <div class="ctl"><input id="f_res_night" type="number" min="0" inputmode="numeric" placeholder="예) 2000"/><span class="suffix">원</span></div>
                        </div>
                    </div>
                </div>

                <!-- (B) 일반노상주차장(승용차·일반) 요금 -->
                <div id="normal_fee_wrap">
                    <h3 class="help" style="margin:.2rem 0">일반노상주차장 요금(승용차·일반)</h3>
                    <div class="fee-group">
                        <!-- 1행 -->
                        <div class="fee-item">
                            <label for="f_fee_first30">최초 30분</label>
                            <div class="ctl"><input id="f_fee_first30" type="number" min="0" inputmode="numeric" placeholder="예) 1000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_fee_per10">매 10분</label>
                            <div class="ctl"><input id="f_fee_per10" type="number" min="0" inputmode="numeric" placeholder="예) 300"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_fee_per60">1시간</label>
                            <div class="ctl"><input id="f_fee_per60" type="number" min="0" inputmode="numeric" placeholder="예) 2000"/><span class="suffix">원</span></div>
                        </div>
                        <!-- 2행 -->
                        <div class="fee-item">
                            <label for="f_fee_daily">전일(일)</label>
                            <div class="ctl"><input id="f_fee_daily" type="number" min="0" inputmode="numeric" placeholder="예) 10000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_fee_monthly">월정기권</label>
                            <div class="ctl"><input id="f_fee_monthly" type="number" min="0" inputmode="numeric" placeholder="예) 120000"/><span class="suffix">원</span></div>
                        </div>
                        <div class="fee-item">
                            <label for="f_fee_halfyear">반기권</label>
                            <div class="ctl"><input id="f_fee_halfyear" type="number" min="0" inputmode="numeric" placeholder="예) 600000"/><span class="suffix">원</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 요금지불방식 : 추가 -->
            <div id="fee_pay_wrap" class="fee-block card" style="grid-column:1/-1">
                <h2 class="fee-title">요금 지불방식</h2>

                <div class="grid row-1c">
                    <div class="check-group" aria-label="요금 지불방식">
                        <label><input type="checkbox" name="payMethod" value="현금" /> <span>현금</span></label>
                        <label><input type="checkbox" name="payMethod" value="신용카드" /> <span>신용카드</span></label>
                        <label><input type="checkbox" name="payMethod" value="상품권" /> <span>상품권</span></label>

                        <!-- 기타(텍스트 입력) -->
                        <label class="pay-etc" style="display:inline-flex; align-items:center; gap:8px;">
                            <input type="checkbox" id="pay_etc_chk" value="기타" />
                            <span>기타</span>
                            <input type="text" id="pay_etc_input" class="input"
                                   placeholder="기타 지불수단 입력" disabled
                                   style="max-width:280px;" />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="card">
        <div class="actions">
            <button class="btn" id="btnSave">저장</button>
            <span class="muted">샘플 저장입니다. 실제 API로 교체하세요.</span>
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
<script src="<c:url value='/static/js/offparking.js'/>"></script>
</body>
</html>