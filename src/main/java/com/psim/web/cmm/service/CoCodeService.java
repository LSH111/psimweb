package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoCodeVO;
import com.psim.web.cmm.vo.CoCodeGroupVO;
import com.psim.web.cmm.vo.CoLdongVO;

import java.util.List;
import java.util.Map;

public interface CoCodeService {
    
    /**
     * 그룹코드별 공통코드 목록 조회
     */
    List<CoCodeVO> getCodeListByGroup(String groupCd);
    
    /**
     * 상위 코드에 따른 하위 코드 목록 조회
     */
    List<CoCodeVO> getSubCodeList(Map<String, Object> params);

    /**
     * 시군구코드에 따른 읍면동 목록 조회
     */
    List<CoLdongVO> getLdongList(String sigunguCd);

    /**
     * 모든 코드 그룹 목록 조회
     */
    List<CoCodeGroupVO> getCodeGroupList();

    /**
     * 모든 코드 그룹 정보를 집계하여 조회
     */
    Map<String, String> getCodeGroupsAggregated();
}
