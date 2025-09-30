package com.psim.web.prk.mapper;

import com.psim.web.prk.vo.AtchPrklotInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AtchPrklotInfoMapper {
    List<AtchPrklotInfoVO> selectAllAtchPrklotInfos();
    AtchPrklotInfoVO selectAtchPrklotInfoById(Integer prkPlceInfoSn);
    void insertAtchPrklotInfo(AtchPrklotInfoVO info);
    void updateAtchPrklotInfo(AtchPrklotInfoVO info);
    void deleteAtchPrklotInfo(Integer prkPlceInfoSn);
}
