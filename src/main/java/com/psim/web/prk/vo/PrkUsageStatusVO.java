package com.psim.web.prk.vo;

import lombok.Data;

/**
 * 주차이용실태 VO (tb_prklot_cmpl_info 테이블)
 */
@Data
public class PrkUsageStatusVO {
    // 테이블 컬럼
    private String prkBizMngNo;         // 사업관리번호 (prk_biz_mng_no)
    private String examinDd;            // 조사일자 (examin_dd) - timestamp
    private String examinTimelge;       // 조사시간 (examin_timelge)
    private String srvyId;              // 조사자ID (srvy_id)
    private String srvyTel;             // 조사자 전화번호 (srvy_tel)
    private String dyntDvCd;            // 주야간구분코드 (dynt_dv_cd)
    private String vhcleNo;             // 차량번호 (vhcle_no)
    private String vhctyCd;             // 차종코드 (vhcty_cd)
    private String lawGbn;              // 법적/불법 구분 (law_gbn)
    private String lawCd;               // 적/불 코드 (law_cd)
    private String plceLat;             // 위도 (plce_lat)
    private String plceLon;             // 경도 (plce_lon)
    private String hdInoutCd;           // 전/후방 코드 (hd_inout_cd)
    private String vhcleRegYn;          // 차량등록여부 (vhcle_reg_yn)
    private String remark;              // 비고 (remark)
    private String regDt;               // 등록일시 (reg_dt)
    private String rgstId;              // 등록자ID (rgst_id)
    private String rgstIpAddr;          // 등록자IP (rgst_ip_addr)
    private String updtDt;              // 수정일시 (updt_dt)
    private String updusrId;            // 수정자ID (updusr_id)
    private String updusrIpAddr;        // 수정자IP (updusr_ip_addr)
    private String cmplSn;              // 실태조사일련번호 (cmpl_sn)

    // 조인용 추가 필드
    private String prkplceNm;           // 주차장명
    private String sidoNm;              // 시도명
    private String sigunguNm;           // 시군구명
    private String lgalEmdNm;           // 법정읍면동명
    private String dtadd;               // 지번주소

    // 🔥 코드명 필드 추가
    private String vhctyNm;             // 차종명
    private String dyntDvNm;            // 주야간구분명
    private String lawCdNm;             // 적/불법명 ✅ 이 필드 추가!
    private String vhcleRegYnNm;        // 차량등록여부명

    // 🔥 행정구역 코드 추가
    private String sidoCd;              // 시도코드
    private String sigunguCd;           // 시군구코드
    private String emdCd;               // 읍면동코드
    private String ri;                  // 리

    // 검색 조건
    private String searchYear;          // 검색-조사년도
    private String searchSidoCode;      // 검색-시/도
    private String searchSigunguCode;   // 검색-시/군/구
    private String searchEmdCode;       // 검색-읍/면/동 ✅ 추가
    private String searchLawCd;         // 검색-적/불 (law_cd)
    private String searchDyntDvCd;      // 검색-주야간구분
    private String searchVehicNo;       // 검색-차량번호
    private String searchVehicleNo;     // 검색-차량번호
    private String searchStartDate;     // 검색-시작일
    private String searchEndDate;       // 검색-종료일

    private String usageId;
    private String statusCode;
    private String usageDt;

    // 페이징
    private int page = 1;
    private int pageSize = 20;
    private int offset;
    private int totalCount;
}