package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoCodeMapper;
import com.psim.web.cmm.service.CoCodeService;
import com.psim.web.cmm.vo.CoCodeVO;
import com.psim.web.cmm.vo.CoCodeGroupVO;
import com.psim.web.cmm.vo.CoLdongVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CoCodeServiceImpl implements CoCodeService {

    private final CoCodeMapper coCodeMapper;

    /**
     * 그룹코드별 공통코드 목록을 조회합니다.
     *
     * @param groupCd 조회할 그룹 코드
     * @return 해당 그룹의 공통코드 목록
     */
    @Override
    public List<CoCodeVO> getCodeListByGroup(String groupCd) {
        return coCodeMapper.selectCodeListByGroup(groupCd);
    }

    /**
     * 상위 코드에 따른 하위 코드 목록을 조회합니다.
     * 주로 시도 -> 시군구 계층 구조 조회에 사용됩니다.
     *
     * @param params 조회 파라미터 (groupCd, upperCodeCd 포함)
     * @return 하위 코드 목록
     */
    @Override
    public List<CoCodeVO> getSubCodeList(Map<String, Object> params) {
        return coCodeMapper.selectSubCodeList(params);
    }

    /**
     * 시군구코드에 따른 읍면동 목록을 조회합니다.
     *
     * @param sigunguCd 시군구 코드
     * @return 해당 시군구의 읍면동 목록
     */
    @Override
    public List<CoLdongVO> getLdongList(String sigunguCd) {
        return coCodeMapper.selectLdongList(sigunguCd);
    }

    /**
     * 모든 코드 그룹 목록을 조회합니다.
     *
     * @return 코드 그룹 목록
     */
    @Override
    public List<CoCodeGroupVO> getCodeGroupList() {
        return coCodeMapper.selectCodeGroupList();
    }

    /**
     * 모든 코드 그룹 정보를 집계하여 조회합니다.
     * group_cd를 콤마로 구분된 문자열로 반환합니다.
     *
     * @return 집계된 코드 그룹 정보 (groupCd 키를 포함한 Map)
     */
    @Override
    public Map<String, String> getCodeGroupsAggregated() {
        return coCodeMapper.selectCodeGroupsAggregated();
    }
}
