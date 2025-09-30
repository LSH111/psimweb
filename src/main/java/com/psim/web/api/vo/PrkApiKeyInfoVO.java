package com.psim.web.api.vo;

import lombok.Data;
import java.util.Date;

@Data
public class PrkApiKeyInfoVO {
    private Integer apiKeySn;
    private String apiKey;
    private String apiDesc;
    private String useYn;
    private Date regDt;
    private String rgstId;
    private String rgstIpAddr;
    private Date updtDt;
    private String updusrId;
    private String updusrIpAddr;
}
