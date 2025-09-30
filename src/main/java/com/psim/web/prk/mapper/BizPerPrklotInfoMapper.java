package com.psim.web.prk.mapper;

import com.psim.web.prk.vo.BizPerPrklotInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BizPerPrklotInfoMapper {
    List<BizPerPrklotInfoVO> selectAllBizPerPrklotInfos();
    BizPerPrklotInfoVO selectBizPerPrklotInfoById(Integer bizInfoSn);
    void insertBizPerPrklotInfo(BizPerPrklotInfoVO info);
    void updateBizPerPrklotInfo(BizPerPrklotInfoVO info);
    void deleteBizPerPrklotInfo(Integer bizInfoSn);
}
