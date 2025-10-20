package com.psim.web.cmm.vo;

import lombok.Data;

import java.util.Date;

@Data
public class CoAuthTargetVO {
    private String authCd;
    private String userCd;
    private String rgstId;
    private Date regDt;
    private String rgstIpAddr;
    private String updusrId;
    private Date updtDt;
    private String updusrIpAddr;
}
