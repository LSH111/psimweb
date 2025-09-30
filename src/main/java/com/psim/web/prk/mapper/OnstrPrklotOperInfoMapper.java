package com.psim.web.prk.mapper;

import com.psim.web.prk.vo.OnstrPrklotOperInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface OnstrPrklotOperInfoMapper {
    List<OnstrPrklotOperInfoVO> selectAllOnstrPrklotOperInfos();
    OnstrPrklotOperInfoVO selectOnstrPrklotOperInfoById(Integer operInfoSn);
    void insertOnstrPrklotOperInfo(OnstrPrklotOperInfoVO info);
    void updateOnstrPrklotOperInfo(OnstrPrklotOperInfoVO info);
    void deleteOnstrPrklotOperInfo(Integer operInfoSn);
}
