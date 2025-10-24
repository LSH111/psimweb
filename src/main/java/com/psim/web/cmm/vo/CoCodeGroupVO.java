package com.psim.web.cmm.vo;

import lombok.Data;

import java.util.Date;

@Data
public class CoCodeGroupVO {
    private String groupCd;
    private String codeCd;
    private String codeNm;
    private String groupNm;
    private String rgstId;
    private Date regDt;
    private String rgstIpAddr;
    private String updusrId;
    private Date updtDt;
    private String updusrIpAddr;
    private String useYn;
}
