package com.psim.web.prk.vo;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Data
@Getter
@Setter
public class OffstrPrklotInfoVO {
    private Integer prkPlceInfoSn;
    private String prkPlceManageNo;
    private String prkType;
    private Integer totPrkCnt;
    private Integer disabPrkCnt;
    private Integer compactPrkCnt;
    private Integer ecoPrkCnt;
    private Integer pregnantPrkCnt;
    private String prkOperMthdCd;
    private String operMbyCd;
    private String mgrOrg;
    private String mgrOrgTelNo;
    private String gradArea;
    private String subordnOpertnCd;
    private Date regDt;
    private String rgstId;
    private String rgstIpAddr;
    private Date updtDt;
    private String updusrId;
    private String updusrIpAddr;
}