package com.psim.web.cmm.vo;

import lombok.Data;
import java.util.Date;

@Data
public class CoAuthVO {
    private String authCd;
    private String authNm;
    private String authDesc;
    private String rgstId;
    private Date regDt;
    private String rgstIpAddr;
    private String updusrId;
    private Date updtDt;
    private String updusrIpAddr;
}
