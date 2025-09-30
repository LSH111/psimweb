package com.psim.web.api.mapper;

import com.psim.web.api.vo.PrkApiInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PrkApiInfoMapper {
    List<PrkApiInfoVO> selectAllPrkApiInfos();
    PrkApiInfoVO selectPrkApiInfoById(Integer apiInfoSn);
    void insertPrkApiInfo(PrkApiInfoVO info);
    void updatePrkApiInfo(PrkApiInfoVO info);
    void deletePrkApiInfo(Integer apiInfoSn);
}
