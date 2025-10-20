package com.psim.web.cmm.vo;

import lombok.Data;

import java.util.Date;

@Data
public class CoMenuVO {
    private String menuCd;
    private String menuNm;
    private String upperMenuCd;
    private String menuUrl;
    private Integer menuOrdr;
    private String useYn;
    private String rgstId;
    private Date regDt;
    private String rgstIpAddr;
    private String updusrId;
    private Date updtDt;
    private String updusrIpAddr;
}
