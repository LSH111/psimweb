package com.psim.web.cmm.vo;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Data
@Getter
@Setter
public class CoUserVO {
    private String userId;
    private String userCd;
    private String userNm;
    private String userTyCode;
    private String encyDe;
    private String retireDe;
    private String userSttusCode;
    private String photoUnifiedId;
    private String signUnifiedId;
    private String deptCd;
    private String pstnCd;
    private String clssCd;
    private String rspCd;
    private String userPw;
    private String email;
    private String mbtlnum;
    private String ownhomTelno;
    private String cmpnyTelno;
    private Date rgsde;
    private Date updde;
    private String userOrder;
    private String duty;
    private String pstnDetail;
    private String sigunguCd;
    private String areaCd;
    private String roadYn;
    private String offstreetYn;
    private String attachedYn;
    private String rgstId;
    private Date regDt;
    private String rgstIpAddr;
    private String updusrId;
    private Date updtDt;
    private String updusrIpAddr;
    private String pwdChangeDd;
    private String changeYn;
    private String cfrmYn;
}