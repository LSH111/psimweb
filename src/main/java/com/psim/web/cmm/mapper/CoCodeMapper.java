
package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoCodeVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface CoCodeMapper {
    
    /**
     * 그룹코드별 공통코드 목록 조회
     */
    List<CoCodeVO> selectCodeListByGroup(String groupCd);
    
    /**
     * 상위 코드에 따른 하위 코드 목록 조회 (시도 -> 시군구용)
     */
    List<CoCodeVO> selectSubCodeList(Map<String, Object> params);
}
