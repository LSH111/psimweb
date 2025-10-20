package com.psim.web.prk.vo;

import lombok.Data;

import java.util.Date;

@Data
public class OffstrPrklotOperInfoVO {
    private Integer operInfoSn;
    private Integer prkPlceInfoSn;
    private String prkPlceManageNo;
    private String operDayCd;
    private String weekdayOperTime;
    private String satOperTime;
    private String holidayOperTime;
    private String weekdayCloseTime;
    private String satCloseTime;
    private String holidayCloseTime;
    private Integer bscTime;
    private Integer bscCharge;
    private Integer addTime;
    private Integer addCharge;
    private String dayTicketTime;
    private String dayTicketCharge;
    private String monthTicketCharge;
    private String payMthdCd;
    private String rmrk;
    private Date regDt;
    private String rgstId;
    private String rgstIpAddr;
    private Date updtDt;
    private String updusrId;
    private String updusrIpAddr;
}
