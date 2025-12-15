package com.psim.web.prk.vo;

import lombok.Data;

/**
 * 주차장 상세 정보 통합 VO
 * - 노상주차장(tb_onstr_prklot_info)
 * - 노외주차장(tb_offstr_prklot_info)
 * - 부설주차장(tb_atch_prklot_info)
 * 모든 주차장 유형을 하나의 VO로 통합 관리
 */
@Data
public class ParkingDetailVO {

    /* ========================================
     * 사업정보 (tb_prk_srvy_biz_info)
     * ======================================== */
    private String prkBizMngNo;        // 주차사업관리번호
    private String bizNm;              // 사업명
    private String bizYy;              // 사업연도
    private String bizExcStDt;         // 사업시작일자
    private String bizExcEdDt;         // 사업종료일자

    /* ========================================
     * 기본 정보 (tb_prk_def_plce_info)
     * ======================================== */
    private String prgsStsCd;          // 진행상태코드
    private String prgsStsRawCd;       // 진행상태 원본 코드
    private String prkPlceManageNo;    // 주차장관리번호
    private Integer prkPlceInfoSn;     // 주차장정보일련번호
    private String prkplceNm;          // 주차장명
    private String prkPlceType;        // 주차장구분 (노상/노외/부설)
    private String ldongCd;            // 법정동코드
    private String zip;                // 우편번호
    private String dtadd;              // 상세주소
    private String prkPlceLat;         // 주차장위도
    private String prkPlceLon;         // 주차장경도
    // 🔥 추가 필드
    private String bdnbr;              // 건물번호
    private String lnmMnno;            // 본번
    private String lnmSbno;            // 부번
    private String mntnYn;             // 산여부
    private String liCd;               // 리코드
    private String roadaddr;           // 도로명주소
    private String rnmadr;             // 도로명주소 필드 추가
    /* ========================================
     * 행정구역 정보 (tb_co_ldong)
     * ======================================== */
    private String sidoCd;             // 시도코드
    private String sidoNm;             // 시도명
    private String sigunguCd;          // 시군구코드
    private String sigunguNm;          // 시군구명
    private String emdCd;              // 읍면동코드
    private String lgalEmdNm;          // 법정읍면동명
    private String adstrdCd;           // 행정동코드

    /* ========================================
     * 사업별 주차장 정보 (tb_biz_per_prklot_info)
     * ======================================== */
    private String bizPerPrkMngNo;     // 사업별주차관리번호
    private String survyId;            // 조사자ID
    private String survyDt;            // 조사일자
    private String rejtRsn;            // 반려 사유

    /* ========================================
     * 공통 업데이트 정보
     * ======================================== */
    private String updusrId;           // 수정자ID
    private String updusrIpAddr;       // 수정자IP주소
    private String regDt;              // 등록일시
    private String updtDt;             // 수정일시

    /* ========================================
     * 주차면수 정보
     * (tb_onstr_prklot_info / tb_offstr_prklot_info / tb_atch_prklot_info 공통)
     * ======================================== */
    private Integer totPrkCnt;         // 총주차면수
    private Integer disabPrkCnt;       // 장애인주차면수
    private Integer compactPrkCnt;     // 경차주차면수
    private Integer ecoPrkCnt;         // 친환경차주차면수
    private Integer pregnantPrkCnt;    // 임산부주차면수

    /* ========================================
     * 운영 정보
     * (tb_onstr_prklot_info / tb_offstr_prklot_info / tb_atch_prklot_info 공통)
     * ======================================== */
    private String prkOperMthdCd;      // 주차운영방식코드 (일반노상/거주자우선 등)
    private String operMbyCd;          // 운영주체코드 (시운영/구운영/공단위탁/민간위탁)
    private String mgrOrg;             // 관리기관명
    private String mgrOrgTelNo;        // 관리기관전화번호
    private String subordnOpertnCd;    // 부제운영코드 (부제시행여부)

    /* ========================================
     * 운영시간 정보
     * (*_prklot_oper_info 공통)
     * ======================================== */
    private String dyntDvCd;           // 주야간구분코드

    // 주간 운영시간
    private String wkZon;              // 주간구역
    private String wkWkdyOperTmCd;     // 주간평일운영시간코드
    private String wkWkdyOperStarTm;   // 주간평일운영시작시간
    private String wkWkdyOperEndTm;    // 주간평일운영종료시간
    private String wkSatOperTmCd;      // 주간토요일운영시간코드
    private String wkSatOperStarTm;    // 주간토요일운영시작시간
    private String wkSatOperEndTm;     // 주간토요일운영종료시간
    private String wkHldyOperTmCd;     // 주간공휴일운영시간코드
    private String wkHldyOperStarTm;   // 주간공휴일운영시작시간
    private String wkHldyOperEndTm;    // 주간공휴일운영종료시간

    // 야간 운영시간
    private String ntZon;              // 야간구역
    private String ntWkdyOperTmCd;     // 야간평일운영시간코드
    private String ntWkdyOperStarTm;   // 야간평일운영시작시간
    private String ntWkdyOperEndTm;    // 야간평일운영종료시간
    private String ntSatOperTmCd;      // 야간토요일운영시간코드
    private String ntSatOperStarTm;    // 야간토요일운영시작시간
    private String ntSatOperEndTm;     // 야간토요일운영종료시간
    private String ntHldyOperTmCd;     // 야간공휴일운영시간코드
    private String ntHldyOperStarTm;   // 야간공휴일운영시작시간
    private String ntHldyOperEndTm;    // 야간공휴일운영종료시간

    /* ========================================
     * 주간 요금 정보
     * (*_prklot_oper_info 공통)
     * ======================================== */
    private String wkFeeAplyCd;        // 주간요금적용코드

    // 거주자우선주차장 요금
    private Integer wkResDayFee;       // 주간거주자전일요금
    private Integer wkResWkFee;        // 주간거주자주간요금
    private Integer wkResFtFee;        // 주간거주자상근요금
    private Integer wkResNtFee;        // 주간거주자야간요금

    // 일반노상주차장 요금
    private Integer wkGnFrst30mFee;    // 주간일반최초30분요금
    private Integer wkGnInt10mFee;     // 주간일반매10분요금
    private Integer wkGn1hFee;         // 주간일반1시간요금
    private Integer wkGnDayFee;        // 주간일반전일요금

    // 정기권 요금
    private Integer wkFeeMnthPassPrc;  // 주간요금월정기권가격
    private Integer wkFeeHfyrPassPrc;  // 주간요금반기권가격

    // 요금 방식
    private String wkFeeMthdCd;        // 주간요금방식코드
    private String wkFeeStlmtMthdCd;   // 주간요금정산방식코드
    private String wkFeePayMthdOthr;   // 주간요금지불방식기타

    /* ========================================
     * 야간 요금 정보
     * (*_prklot_oper_info 공통)
     * ======================================== */
    private String ntFeeAplyCd;        // 야간요금적용코드

    // 거주자우선주차장 요금
    private Integer ntResDayFee;       // 야간거주자전일요금
    private Integer ntResWkFee;        // 야간거주자주간요금
    private Integer ntResFtFee;        // 야간거주자상근요금
    private Integer ntResNtFee;        // 야간거주자야간요금

    // 일반노상주차장 요금
    private Integer ntGnFrst30mFee;    // 야간일반최초30분요금
    private Integer ntGnInt10mFee;     // 야간일반매10분요금
    private Integer ntGn1hFee;         // 야간일반1시간요금
    private Integer ntGnDayFee;        // 야간일반전일요금

    // 정기권 요금
    private Integer ntFeeMnthPassPrc;  // 야간요금월정기권가격
    private Integer ntFeeHfyrPassPrc;  // 야간요금반기권가격

    // 요금 방식
    private String ntFeeMthdCd;        // 야간요금방식코드
    private String ntFeeStlmtMthdCd;   // 야간요금정산방식코드
    private String ntFeePayMthdOthr;   // 야간요금지불방식기타

    /* ========================================
     * 안전 및 시설 정보 (노상주차장)
     * (tb_onstr_prklot_oper_info)
     * ======================================== */
    private String prklotSignYn;       // 주차장표지판유무

    private String slpYn;              // 경사구간여부 (slpSecYn -> slpYn)
    private String slpSecYn;           // 경사구간여부 (DB: slp_sec_yn)
    private Integer sixleCnt;          // 6프로이하
    private Integer sixgtCnt;          // 6프로상
    private String slp4to6Yn;          // 경사도4~6%여부
    private String slp6gtAreaCnt;      // 경사도6%초과구간수 (sixleCnt -> slp6gtAreaCnt)
    private String slp7gtAreaCnt;      // 경사도7%초과구간수 (sixgtCnt -> slp7gtAreaCnt)
    private String antislpFcltyYn;     // 미끄럼방지시설유무
    private String slpCtnGuidSignYn;   // 미끄럼주의안내표지판유무

    /* ========================================
     * 안전시설 정보 (노외/부설 주차장)
     * (tb_offstr_prklot_oper_info / tb_atch_prklot_oper_info)
     * ======================================== */
    private Integer spdBumpQty;        // 과속방지턱수량
    private Integer stopLineQty;       // 정지선수량
    private Integer crswlkQty;         // 횡단보도수량
    private String fallPrevFcltyYn;    // 추락방지시설유무

    /* ========================================
     * 운영 상세 정보 (노외/부설 주차장)
     * (tb_offstr_prklot_oper_info / tb_atch_prklot_oper_info)
     * ======================================== */
    private Integer ntPrkVehCnt;       // 야간주차차량수
    private Integer wkPrkVehCnt;       // 주간주차차량수
    private String tcktMchnYn;         // 발권기유무
    private String barrGteYn;          // 차단기유무
    private String exitAlrmYn;         // 출차알림유무 (exitGteYn -> exitAlrmYn)
    private String vehRcgnTpCd;        // 차량인식유형코드
    private String wkPeakStrTm;        // 주간혼잡시작시간
    private String wkPeakEndTm;        // 주간혼잡종료시간
    private String ntPeakStrTm;        // 야간혼잡시작시간
    private String ntPeakEndTm;        // 야간혼잡종료시간
    private String prklotEntrLat;      // 주차장입구위도
    private String prklotEntrLon;      // 주차장입구경도
    private String bldg2fPrklotCd;     // 건물2층이상주차장코드

    /* ========================================
     * 부설주차장 전용 정보
     * (tb_atch_prklot_info / tb_atch_prklot_oper_info)
     * ======================================== */
    private String bldgNm;             // 건물명
    private String bldgMngNo;          // 건물관리번호
    private String bldgUsgCd;          // 건물용도코드
    private Integer bldgFlrCnt;        // 건물층수
    private Integer undgrFlrCnt;       // 지하층수
    private String mechPrkYn;          // 기계식주차여부
    private String prkAreaDvCd;        // 주차구역구분코드 (실내/실외)

    // 🔥 부설주차장 추가 필드 (SQL 쿼리 기반)
    //private String prgsStsRawCd;       // 진행상태 원본 코드
    //private String bdnbr;              // 건물번호 (지번)
    private String closedYn;           // 폐쇄여부
    private String parkingType;
    // 주차장구분
    private String prkplceSe;          // 주차장구분 (PRK_001)
    // 변경: 관리주체(소유주체) 코드(프론트 ownCd 매핑용 별칭)
    private String ownCd;

    // 위탁/직영 회사명
    private String trutCompNm;         // 위탁회사명
    private String dirtCompNm;         // 직영회사명
    private String compNm;             // 운영주체별 표시용 회사명 (위탁/직영 매핑)

    // 허가 및 검사 정보
    private String prmisnDt;           // 허가일자
    private String useInspDt;          // 사용검사일자

    // 면적 정보
    private String plotAr;             // 대지면적
    private String myeonAr;            // 연면적

    // 기계식주차장 정보
    private String mechPrklotTpCd;     // 기계식주차장형태코드 (PRK_004)
    private String mechPrklotOperYn;   // 기계식주차장작동여부 (PRK_005)
    private Integer mechPrkInopCnt;    // 기계식주차불능대수
    // 주차시설형태 총계
    private Integer prkFcltyTpTotFlrCapa;   // 주차시설형태_총_층수
    private Integer prkFcltyTpTotDeckCapa;  // 주차시설형태_총_면적
    // 실내 자주식
    private Integer indrSelfTotSpaceCnt;    // 실내자주식_총주차대수
    private Integer indrSelfFlrCnt;         // 실내자주식_층수
    private Integer indrSelfDeckCnt;        // 실내자주식_면적
    // 실내 기계식
    private Integer indrMechTotSpaceCnt;    // 실내기계식_총주차대수
    private Integer indrMechFlrCnt;         // 실내기계식_층수
    private Integer indrMechDeckCnt;        // 실내기계식_면적
    // 실외 자주식
    private Integer outdrSelfTotSpaceCnt;   // 실외자주식_총주차대수
    private Integer outdrSelfFlrCnt;        // 실외자주식_층수
    private Integer outdrSelfDeckCnt;      // 실외자주식_체크수
    // 실외 기계식
    private Integer outdrMechTotSpaceCnt;   // 실외기계식_총주차대수
    private Integer outdrMechFlrCnt;        // 실외기계식_층수
    private Integer outdrMechDeckCnt;       // 실외기계식_면적
    // 운영시간 (부설주차장용 - 평일/토/공휴일)
    private String wkdyOperTmCd;            // 평일운영시간코드 (PRK_006)
    private String wkdyTmbasOperStrTm;      // 평일시간기반운영시작시간
    private String wkdyTmbasOperEndTm;      // 평일시간기반운영종료시간
    private String satOperTmCd;             // 토요일운영시간코드 (PRK_006)
    private String satTmbasOperStrTm;       // 토요일시간기반운영시작시간
    private String satTmbasOperEndTm;       // 토요일시간기반운영종료시간
    private String hldyOperTmCd;            // 공휴일운영시간코드 (PRK_006)
    private String hldyTmbasOperStrTm;      // 공휴일시간기반운영시작시간
    private String hldyTmbasOperEndTm;      // 공휴일시간기반운영종료시간
    // 요금 정보 (부설주차장용)
    private String feeImpsCd;               // 요금부과코드 (PRK_007)
    private Integer feeFrst30minPrc;        // 요금_최초30분가격
    private Integer fee10minPrc;            // 요금_10분가격
    private Integer fee1hrPrc;              // 요금_1시간가격
    private Integer feeDayPrc;              // 요금_일일가격
    private Integer feeMnthPassPrc;         // 요금_월정기권가격
    private Integer feeHfyrPassPrc;         // 요금_반기권가격
    private String feePayMthdCd;            // 요금지불방식코드
    private String feePayMthdOthr;          // 요금지불방식기타
    private String feeSetlMthdCd;           // 요금정산방식코드
    // 시설 정보 (부설주차장용)
    private String prklotSignCd;            // 주차장표지판코드
    // 공개 정보
    private String pblOpenYn;               // 대중공개여부
    private String prklotInfoPrvsnCnstYn;   // 주차장정보제공동의여부
    // 기계식주차장 안전관리
    private String guidDocYn;               // 안내문유무
    private String safeInspYn;              // 안전검사유무
    private String mgrYn;                   // 관리인유무
    private String admYn;                   // 관리자유무
    // 급지
    private String alZon;                   // 급지
    private String chrgGrdCd;
    /* ========================================
     * 기타 공통 정보
     * ======================================== */
    private String partclrMatter;      // 특이사항 (비고)
    private String rmk;                // 비고

    public void setPrkplceSe(String prkplceSe) {
        this.prkplceSe = prkplceSe;
        if ((this.ownCd == null || this.ownCd.trim().isEmpty()) && prkplceSe != null && !prkplceSe.trim().isEmpty()) {
            this.ownCd = prkplceSe;
        }
    }

    // 변경: ownCd 세터에서 prkplceSe 비어있을 때 동기화
    public void setOwnCd(String ownCd) {
        this.ownCd = ownCd;
        if ((this.prkplceSe == null || this.prkplceSe.trim().isEmpty()) && ownCd != null && !ownCd.trim().isEmpty()) {
            this.prkplceSe = ownCd;
        }
    }
}
