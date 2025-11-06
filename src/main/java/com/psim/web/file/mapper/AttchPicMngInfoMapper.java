package com.psim.web.file.mapper;

import com.psim.web.file.vo.AttchPicMngInfoVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

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
}
