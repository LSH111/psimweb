package com.psim.web.prk.mapper;

import com.psim.web.prk.vo.PrkDefPlceInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PrkDefPlceInfoMapper {
    List<PrkDefPlceInfoVO> selectAllPrkDefPlceInfos();
    PrkDefPlceInfoVO selectPrkDefPlceInfoById(Integer prkPlceInfoSn);
    void insertPrkDefPlceInfo(PrkDefPlceInfoVO info);
    void updatePrkDefPlceInfo(PrkDefPlceInfoVO info);
    void deletePrkDefPlceInfo(Integer prkPlceInfoSn);
}
