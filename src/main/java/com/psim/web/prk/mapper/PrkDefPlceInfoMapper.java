package com.psim.web.prk.mapper;

import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PrkDefPlceInfoMapper {

    // ========== 목록 조회 ==========
    List<ParkingListVO> selectParkingList(Map<String, Object> params);
    List<ParkingListVO> selectParkingListForMap(Map<String, Object> params);

    // ========== 상세 조회 ==========
    ParkingDetailVO selectOnstreetParkingDetail(String prkPlceManageNo);
    ParkingDetailVO selectOffstreetParkingDetail(String prkPlceManageNo);
    ParkingDetailVO selectBuildParkingDetail(String prkPlceManageNo);

    // ========== 신규 등록 ==========
    String generateParkingManageNo(@Param("zipCode") String zipCode,
                                   @Param("prkplceSe") String prkplceSe,
                                   @Param("operMbyCd") String operMbyCd,
                                   @Param("prkPlceType") String prkPlceType);
    // 🔥 추가: 주차장정보일련번호 생성
    Integer generateParkingInfoSn(@Param("prkPlceManageNo") String prkPlceManageNo);
    void insertOnstreetParking(ParkingDetailVO vo);
    void insertOffstreetParking(ParkingDetailVO vo);
    void insertBuildParking(ParkingDetailVO vo);
    // 🔥 4개의 INSERT 메서드 분리
    void insertPrkDefPlceInfo(ParkingDetailVO vo);
    void insertBizPerPrklotInfo(ParkingDetailVO vo);
    void insertOnstrPrklotInfo(ParkingDetailVO vo);
    void insertOnstrPrklotOperInfo(ParkingDetailVO vo);


    // ========== 수정 ==========
    void updatePrkDefPlceInfo(ParkingDetailVO vo);
    void updateOnstrPrklotInfo(ParkingDetailVO vo);
    void updateOnstrPrklotOperInfo(ParkingDetailVO vo);
    void updateOffstrPrklotInfo(ParkingDetailVO vo);
    void updateOffstrPrklotOperInfo(ParkingDetailVO vo);
    void updateAtchPrklotInfo(ParkingDetailVO vo);
    void updateAtchPrklotOperInfo(ParkingDetailVO vo);
    void updateBizPerPrklotPrgsSts(ParkingDetailVO vo);

    // ========== 상태 변경 ==========
    int updateStatusToPending(List<String> manageNoList);
}