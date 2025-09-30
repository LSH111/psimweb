package com.psim.web.prk.mapper;

import com.psim.web.prk.vo.PrkSrvyBizInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PrkSrvyBizInfoMapper {
    List<PrkSrvyBizInfoVO> selectAllPrkSrvyBizInfos();
    PrkSrvyBizInfoVO selectPrkSrvyBizInfoById(Integer bizSurveySn);
    void insertPrkSrvyBizInfo(PrkSrvyBizInfoVO info);
    void updatePrkSrvyBizInfo(PrkSrvyBizInfoVO info);
    void deletePrkSrvyBizInfo(Integer bizSurveySn);
}
