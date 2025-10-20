package com.psim.web.cmm.vo;

import lombok.Data;

import java.util.Date;

@Data
public class CoCodeVO {
    private String groupCd;      // 그룹코드
    private String codeCd;       // 코드 (value)
    private String codeNm;       // 코드명 (name)
    private String codeDesc;     // 코드설명
    private String rgstId;       // 등록자ID
    private Date regDt;          // 등록일시
    private String rgstIpAddr;   // 등록IP주소
    private String updusrId;     // 수정자ID
    private Date updtDt;         // 수정일시
    private String updusrIpAddr; // 수정IP주소
    private String useYn;        // 사용여부
    private Integer sortOrdr;    // 정렬순서
    
    // 추가 필드 (상위코드 참조용)
    private String upperCodeCd;  // 상위코드
}
