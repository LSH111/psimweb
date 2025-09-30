package com.psim.web.prk.mapper;

import com.psim.web.prk.vo.OnstrPrklotInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface OnstrPrklotInfoMapper {
    List<OnstrPrklotInfoVO> selectAllOnstrPrklotInfos();
    OnstrPrklotInfoVO selectOnstrPrklotInfoById(Integer prkPlceInfoSn);
    void insertOnstrPrklotInfo(OnstrPrklotInfoVO info);
    void updateOnstrPrklotInfo(OnstrPrklotInfoVO info);
    void deleteOnstrPrklotInfo(Integer prkPlceInfoSn);
}