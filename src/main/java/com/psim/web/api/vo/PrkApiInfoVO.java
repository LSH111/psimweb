package com.psim.web.api.vo;

import lombok.Data;
import java.util.Date;

@Data
public class PrkApiInfoVO {
    private Integer apiInfoSn;
    private String apiNm;
    private String apiUrl;
    private String apiDesc;
    private String useYn;
    private Date regDt;
    private String rgstId;
    private String rgstIpAddr;
    private Date updtDt;
    private String updusrId;
    private String updusrIpAddr;
}
