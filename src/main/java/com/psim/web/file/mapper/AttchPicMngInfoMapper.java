package com.psim.web.file.mapper;

import com.psim.web.file.vo.AttchPicMngInfoVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

@Mapper
public interface AttchPicMngInfoMapper {

    void insertAttchPicMngInfo(AttchPicMngInfoVO vo);

    void updateAttchPicMngInfo(AttchPicMngInfoVO vo);

    void deleteAttchPicMngInfo(
            @Param("prkPlceInfoSn") Integer prkPlceInfoSn,
            @Param("prkImgId") String prkImgId,
            @Param("seqNo") Integer seqNo
    );

    List<AttchPicMngInfoVO> selectAttchPicMngInfoList(
            @Param("prkPlceInfoSn") Integer prkPlceInfoSn,
            @Param("prkImgId") String prkImgId,
            @Param("seqNo") Integer seqNo
    );

    Integer selectMaxSeqNo(
            @Param("prkPlceInfoSn") Integer prkPlceInfoSn,
            @Param("prkImgId") String prkImgId
    );

    Integer selectMaxSeqNoForUsage(
            @Param("cmplSn") String cmplSn,
            @Param("prkImgId") String prkImgId
    );

    /**
     * 🔥 단속일련번호로 파일 목록 조회
     */
    List<AttchPicMngInfoVO> selectAttchPicMngInfoListByCmplSn(
            @Param("cmplSn") String cmplSn,
            @Param("prkImgId") String prkImgId
    );

    /**
     * 🔥 주차장 정보 일련번호로 사진 목록 조회
     */
    List<Map<String, Object>> selectPhotosByPrkPlceInfoSn(@Param("prkPlceInfoSn") Integer prkPlceInfoSn);

    /**
     * 🔥 사진 파일 데이터 조회 (주차장용 - 복합키)
     */
    Map<String, Object> selectPhotoFile(
            @Param("prkPlceInfoSn") Integer prkPlceInfoSn,
            @Param("prkImgId") String prkImgId,
            @Param("seqNo") Integer seqNo
    );

    /**
     * 🔥 사진 파일 데이터 조회 (이용실태용 - 복합키)
     */
    Map<String, Object> selectPhotoFileForUsage(
            @Param("cmplSn") String cmplSn,
            @Param("prkImgId") String prkImgId,
            @Param("seqNo") Integer seqNo
    );
}
