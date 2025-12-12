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
    private String prkPlceType;      // 주차장유형명
    private String prkPlceTypeCd;    // 주차장유형코드
    private String prkplceNm;        // 주차장명
    private String bizPerPrkMngNo;   // 사업자주차관리번호
    private String prkBizMngNo;      // 주차사업관리번호
    private String prkPlceManageNo;  // 주차장관리번호
    private Integer prkPlceInfoSn;   // 주차장정보일련번호

    // 🔥 지도용 좌표 필드 추가
    private String prkPlceLat;       // 위도
    private String prkPlceLon;       // 경도

    // 🔥 상태명
    private String prgsStsNm;        // 진행상태명

    // 🔥 요약/팝업용 추가 필드
    private Integer totPrkCnt;          // 주차면수 총계
    private Integer disabPrkCnt;        // 장애인
    private Integer ecoPrkCnt;          // 친환경
    private Integer compactPrkCnt;      // 경차
    private Integer pregnantPrkCnt;     // 임산부

    // 🔥 지도 요금 정보 (주간/야간 구분)
    private Integer dayFeeFirst30m;     // 주간 최초 30분
    private Integer dayFeePer10m;       // 주간 10분당
    private Integer dayFeePer60m;       // 주간 60분당
    private Integer dayFeeDay;          // 주간 일일
    private Integer dayFeeMonthly;      // 주간 월 정기권
    private Integer dayFeeHalfyear;     // 주간 반기권
    private String dayFeeApplyCd;       // 주간 요금 부과여부 코드
    private String dayFeeApplyNm;       // 주간 요금 부과여부 명
    private Integer nightFeeFirst30m;   // 야간 최초 30분
    private Integer nightFeePer10m;     // 야간 10분당
    private Integer nightFeePer60m;     // 야간 60분당
    private Integer nightFeeDay;        // 야간 일일
    private Integer nightFeeMonthly;    // 야간 월 정기권
    private Integer nightFeeHalfyear;   // 야간 반기권
    private String nightFeeApplyCd;     // 야간 요금 부과여부 코드
    private String nightFeeApplyNm;     // 야간 요금 부과여부 명

    private String dayWkdyOperTmCd;     // 평일 운영시간 코드(주간)
    private String dayWkdyStartTm;      // 평일 시작시간(주간)
    private String dayWkdyEndTm;        // 평일 종료시간(주간)
    private String nightWkdyOperTmCd;   // 평일 운영시간 코드(야간)
    private String nightWkdyStartTm;    // 평일 시작시간(야간)
    private String nightWkdyEndTm;      // 평일 종료시간(야간)

    // 🔥 토요일/공휴일 운영시간
    private String satDayStartTm;
    private String satDayEndTm;
    private String satNightStartTm;
    private String satNightEndTm;
    private String hldyDayStartTm;
    private String hldyDayEndTm;
    private String hldyNightStartTm;
    private String hldyNightEndTm;
}
