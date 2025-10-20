package com.psim.web.prk.vo;

import lombok.Data;

import java.util.Date;

@Data
public class BizPerPrklotInfoVO {
    private Integer bizInfoSn;
    private String prkPlceManageNo;
    private Integer bizSurveySn;
    private String bizTargetYn;
    private Date regDt;
    private String rgstId;
    private String rgstIpAddr;
    private Date updtDt;
    private String updusrId;
    private String updusrIpAddr;
}
