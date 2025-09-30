package com.psim.web.prk.mapper;

import com.psim.web.prk.vo.AtchPrklotOperInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AtchPrklotOperInfoMapper {
    List<AtchPrklotOperInfoVO> selectAllAtchPrklotOperInfos();
    AtchPrklotOperInfoVO selectAtchPrklotOperInfoById(Integer operInfoSn);
    void insertAtchPrklotOperInfo(AtchPrklotOperInfoVO info);
    void updateAtchPrklotOperInfo(AtchPrklotOperInfoVO info);
    void deleteAtchPrklotOperInfo(Integer operInfoSn);
}
