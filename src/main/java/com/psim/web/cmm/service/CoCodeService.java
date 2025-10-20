package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoCodeVO;
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
}
