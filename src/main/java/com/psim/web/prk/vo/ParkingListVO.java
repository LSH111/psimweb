
package com.psim.web.prk.vo;

import lombok.Data;

@Data
public class ParkingListVO {
    private String prgsStsCd;        // 진행상태코드
    private String sidoCd;           // 시도코드
    private String sidoNm;           // 시도명
    private String sigunguCd;        // 시군구코드
    private String sigunguNm;        // 시군구명
    private String emdCd;            // 읍면동코드
    private String lgalEmdNm;        // 법정읍면동명
    private String zip;              // 우편번호
    private String dtadd;            // 상세주소
    private String userNm;           // 사용자명
    private String prkPlceType;      // 주차장유형
    private String prkplceNm;        // 주차장명
    private String bizPerPrkMngNo;   // 사업자주차관리번호
    private String prkBizMngNo;      // 주차사업관리번호
    private String prkPlceManageNo;  // 주차장관리번호
    private Integer prkPlceInfoSn;   // 주차장정보일련번호

    // 🔥 지도용 좌표 필드 추가
    private String prkPlceLat;       // 위도
    private String prkPlceLon;       // 경도
}
