package com.psim.web.prk.vo;

import lombok.Data;

import java.util.Date;

@Data
public class PrkSrvyBizInfoVO {
    private Integer bizSurveySn;
    private String bizNm;
    private String bizContent;
    private String bizStartDate;
    private String bizEndDate;
    private String bizBudget;
    private String bizStatus;
    private Date regDt;
    private String rgstId;
    private String rgstIpAddr;
    private Date updtDt;
    private String updusrId;
    private String updusrIpAddr;
}
