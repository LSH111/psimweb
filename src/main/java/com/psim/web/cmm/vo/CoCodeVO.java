package com.psim.web.cmm.vo;

import lombok.Data;

import java.util.Date;

@Data
public class CoCodeVO {
    private String groupCd;
    private String commonCd;
    private String commonCdNm;
    private String commonCdDesc;
    private String rgstId;
    private Date regDt;
    private String rgstIpAddr;
    private String updusrId;
    private Date updtDt;
    private String updusrIpAddr;
    private String useYn;
    private Integer sortOrdr;
}
