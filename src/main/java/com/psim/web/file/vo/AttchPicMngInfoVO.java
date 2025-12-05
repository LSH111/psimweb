
package com.psim.web.file.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttchPicMngInfoVO {
    private String prkPlceManageNo;     // 주차장 관리번호
    private Integer prkPlceInfoSn;      // 주차장 정보 일련번호
    private String prkPlceType;         // 주차장 구분 (01:노상, 02:노외, 03:부설)
    private String prkOperType;         // 운영 타입
    private Integer seqNo;              // 순번
    private String extNm;               // 확장자
    private String filePath;            // 파일 경로
    private String fileNm;              // 파일명
    private String realFileNm;          // 실제 파일명
    private LocalDateTime regDt;        // 등록일시
    private String rgstId;              // 등록자 ID
    private String rgstIpAddr;          // 등록 IP
    private LocalDateTime updtDt;       // 수정일시
    private String updusrId;            // 수정자 ID
    private String updusrIpAddr;        // 수정 IP

    private String prkImgId;            // 이미지 ID

    // 🔥 이용실태 연결용
    private String cmplSn;              // 실태조사일련번호
    private String attachType;          // 첨부 타입 (PARKING=주차장, USAGE=이용실태)
}
