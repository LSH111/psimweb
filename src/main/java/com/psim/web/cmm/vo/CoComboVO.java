package com.psim.web.cmm.vo;

import lombok.Data;

import java.util.Date;

@Data
public class CoComboVO {
    private String comboType;
    private String comboCd;
    private String comboNm;
    private String rgstId;
    private Date regDt;
    private String rgstIpAddr;
    private String updusrId;
    private Date updtDt;
    private String updusrIpAddr;
}
