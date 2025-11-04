package com.psim.web.prk.mapper;

import com.psim.web.prk.vo.PrkUsageStatusVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 주차이용실태 Mapper
 */
@Mapper
public interface PrkUsageStatusMapper {
    
    /**
     * 주차이용실태 목록 조회
     */
    List<PrkUsageStatusVO> selectUsageStatusList(PrkUsageStatusVO vo);
    
    /**
     * 주차이용실태 상세 조회
     */
    PrkUsageStatusVO selectUsageStatusDetail(PrkUsageStatusVO vo);
    
    /**
     * 주차이용실태 등록
     */
    int insertUsageStatus(PrkUsageStatusVO vo);
    
    /**
     * 주차이용실태 수정
     */
    int updateUsageStatus(PrkUsageStatusVO vo);
    
    /**
     * 주차이용실태 삭제
     */
    int deleteUsageStatus(PrkUsageStatusVO vo);
}
