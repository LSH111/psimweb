package com.psim.web.prk.vo;

import lombok.Data;

import java.util.Date;

@Data
public class PrkDefPlceInfoVO {
    private Integer prkPlceInfoSn;
    private String prkPlceNm;
    private String prkPlceManageNo;
    private String prkPlceType;
    private String roadAddr;
    private String jibunAddr;
    private Double lat;
    private Double lon;
    private String telNo;
    private String operInfo;
    private String owner;
    private String agency;
    private String rmrk;
    private Date regDt;
    private String rgstId;
    private String rgstIpAddr;
    private Date updtDt;
    private String updusrId;
    private String updusrIpAddr;
}
