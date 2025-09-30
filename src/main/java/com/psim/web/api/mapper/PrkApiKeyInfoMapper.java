package com.psim.web.api.mapper;

import com.psim.web.api.vo.PrkApiKeyInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PrkApiKeyInfoMapper {
    List<PrkApiKeyInfoVO> selectAllPrkApiKeyInfos();
    PrkApiKeyInfoVO selectPrkApiKeyInfoById(Integer apiKeySn);
    void insertPrkApiKeyInfo(PrkApiKeyInfoVO info);
    void updatePrkApiKeyInfo(PrkApiKeyInfoVO info);
    void deletePrkApiKeyInfo(Integer apiKeySn);
}
