package com.psim.web.prk.mapper;

import com.psim.web.prk.vo.OffstrPrklotInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface OffstrPrklotInfoMapper {
    List<OffstrPrklotInfoVO> selectAllOffstrPrklotInfos();
    OffstrPrklotInfoVO selectOffstrPrklotInfoById(Integer prkPlceInfoSn);
    void insertOffstrPrklotInfo(OffstrPrklotInfoVO info);
    void updateOffstrPrklotInfo(OffstrPrklotInfoVO info);
    void deleteOffstrPrklotInfo(Integer prkPlceInfoSn);
}