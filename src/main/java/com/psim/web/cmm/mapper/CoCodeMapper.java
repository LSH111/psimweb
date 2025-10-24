
package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoCodeVO;
import com.psim.web.cmm.vo.CoCodeGroupVO;
import com.psim.web.cmm.vo.CoLdongVO;
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

    /**
     * 시군구코드에 따른 읍면동 목록 조회
     */
    List<CoLdongVO> selectLdongList(String sigunguCd);

    /**
     * 모든 코드 그룹 정보를 집계하여 조회
     * @return 코드 그룹 목록
     */
    List<CoCodeGroupVO> selectCodeGroupList();

    /**
     * 모든 코드 그룹 정보를 집계하여 조회
     * @return 집계된 코드 그룹 정보 (groupCd 키를 포함한 Map)
     */
    Map<String, String> selectCodeGroupsAggregated();

}
