package com.psim.web.file.vo;

import lombok.Data;

import java.util.Date;

@Data
public class AttchPicMngInfoVO {
    private Integer picMngSn;
    private String unifiedId;
    private String picMngGroup;
    private String orgnlFileNm;
    private String streFileNm;
    private String filePath;
    private Integer fileSz;
    private String fileExtn;
    private Integer prkPlceInfoSn;
    private String prkPlceManageNo;
    private String picDesc;
    private Date regDt;
    private String rgstId;
    private String rgstIpAddr;
    private Date updtDt;
    private String updusrId;
    private String updusrIpAddr;
}
