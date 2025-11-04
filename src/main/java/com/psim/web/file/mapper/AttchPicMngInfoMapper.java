package com.psim.web.file.mapper;

import com.psim.web.file.vo.AttchPicMngInfoVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface AttchPicMngInfoMapper {
    
    void insertAttchPicMngInfo(AttchPicMngInfoVO info);
    
    void updateAttchPicMngInfo(AttchPicMngInfoVO info);
    
    // 🔥 조회
    List<AttchPicMngInfoVO> selectAttchPicMngInfoList(
        @Param("prkPlceInfoSn") Integer prkPlceInfoSn,
        @Param("prkImgId") String prkImgId,
        @Param("seqNo") Integer seqNo
    );
    
    // 🔥 최대 순번 조회
    Integer selectMaxSeqNo(
        @Param("prkPlceInfoSn") Integer prkPlceInfoSn,
        @Param("prkImgId") String prkImgId
    );
    
    // 🔥 삭제
    void deleteAttchPicMngInfo(
        @Param("prkPlceInfoSn") Integer prkPlceInfoSn,
        @Param("prkImgId") String prkImgId,
        @Param("seqNo") Integer seqNo
    );
}
