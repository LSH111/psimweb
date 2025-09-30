package com.psim.web.prk.mapper;

import com.psim.web.prk.vo.OffstrPrklotOperInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface OffstrPrklotOperInfoMapper {
    List<OffstrPrklotOperInfoVO> selectAllOffstrPrklotOperInfos();
    OffstrPrklotOperInfoVO selectOffstrPrklotOperInfoById(Integer operInfoSn);
    void insertOffstrPrklotOperInfo(OffstrPrklotOperInfoVO info);
    void updateOffstrPrklotOperInfo(OffstrPrklotOperInfoVO info);
    void deleteOffstrPrklotOperInfo(Integer operInfoSn);
}
