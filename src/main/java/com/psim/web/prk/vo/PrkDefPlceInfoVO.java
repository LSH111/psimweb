
package com.psim.web.prk.vo;

import lombok.Data;

@Data
public class PrkDefPlceInfoVO {
    // 주차장 정의 장소 정보에 해당하는 필드들을 추가하세요
    // 예시:
    private String prkPlceId;      // 주차장소ID
    private String prkPlceNm;      // 주차장소명
    private String addr;           // 주소
    private String telno;          // 전화번호
    private Integer prkCnt;        // 주차수용대수
    private String operTime;       // 운영시간
    private String prkBsicRate;    // 주차기본요금
    private String prkAddRate;     // 주차추가요금
    private String useYn;          // 사용여부
    private String regDt;          // 등록일시
    private String updDt;          // 수정일시
}
