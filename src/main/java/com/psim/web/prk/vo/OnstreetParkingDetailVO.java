package com.psim.web.prk.vo;

import lombok.Data;

@Data
public class OnstreetParkingDetailVO {
    // 기본 정보 (tb_prk_def_plce_info)
    private String prkPlceManageNo;
    private String prkplceNm;
    private String sidoCd;
    private String sigunguCd;
    private String dtadd;
    private String prkPlceLat;
    private String prkPlceLon;

    // 주차면수 정보 (tb_onstr_prklot_info)
    private Integer totPrkCnt;
    private Integer disabPrkCnt;
    private Integer compactPrkCnt;
    private Integer ecoPrkCnt;
    private Integer pregnantPrkCnt;

    // 운영 정보 (tb_onstr_prklot_info)
    private String prkOperMthdCd;
    private String operMbyCd;
    private String mgrOrg;
    private String mgrOrgTelNo;
    private String subordnOpertnCd;

    // 운영시간 정보 (tb_onstr_prklot_oper_info)
    private String dyntDvCd;

    // 주간 운영
    private String wkZon;
    private String wkWkdyOperTmCd;
    private String wkWkdyOperStarTm;
    private String wkWkdyOperEndTm;
    private String wkSatOperTmCd;
    private String wkSatOperStarTm;
    private String wkSatOperEndTm;
    private String wkHldyOperTmCd;
    private String wkHldyOperStarTm;
    private String wkHldyOperEndTm;

    // 야간 운영
    private String ntZon;
    private String ntWkdyOperTmCd;
    private String ntWkdyOperStarTm;
    private String ntWkdyOperEndTm;
    private String ntSatOperTmCd;
    private String ntSatOperStarTm;
    private String ntSatOperEndTm;
    private String ntHldyOperTmCd;
    private String ntHldyOperStarTm;
    private String ntHldyOperEndTm;

    // 주간 요금 정보
    private String wkFeeAplyCd;
    private Integer wkResDayFee;
    private Integer wkResWkFee;
    private Integer wkResFtFee;
    private Integer wkResNtFee;
    private Integer wkGnFrst30mFee;
    private Integer wkGnInt10mFee;
    private Integer wkGn1hFee;
    private Integer wkGnDayFee;
    private String wkFeeMthdCd;
    private String wkFeeStlmtMthdCd;

    // 야간 요금 정보
    private String ntFeeAplyCd;
    private Integer ntResDayFee;
    private Integer ntResWkFee;
    private Integer ntResFtFee;
    private Integer ntResNtFee;
    private Integer ntGnFrst30mFee;
    private Integer ntGnInt10mFee;
    private Integer ntGn1hFee;
    private Integer ntGnDayFee;
    private String ntFeeMthdCd;

    // 기타 정보
    private String prklotSignYn;
    private String slpSecYn;
    private String sixgtCnt;
    private String antislpFcltyYn;
    private String slpCtnGuidSignYn;
    private String partclrMatter;
}