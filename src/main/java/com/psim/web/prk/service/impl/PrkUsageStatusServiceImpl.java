package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.PrkUsageStatusMapper;
import com.psim.web.prk.service.PrkUsageStatusService;
import com.psim.web.prk.vo.PrkUsageStatusVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 주차이용실태 Service 구현
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PrkUsageStatusServiceImpl implements PrkUsageStatusService {

    private final PrkUsageStatusMapper mapper;

    @Override
    public List<PrkUsageStatusVO> getUsageStatusList(PrkUsageStatusVO vo) {
        // offset 계산
        vo.setOffset((vo.getPage() - 1) * vo.getPageSize());

        // 총 개수 조회
        //int totalCount = mapper.selectUsageStatusCount(vo);
        //vo.setTotalCount(totalCount);

        // 목록 조회
        return mapper.selectUsageStatusList(vo);
    }

    @Override
    public PrkUsageStatusVO getUsageStatusDetail(PrkUsageStatusVO vo) {
        return mapper.selectUsageStatusDetail(vo);
    }

    @Override
    @Transactional
    public int insertUsageStatus(PrkUsageStatusVO vo) {
        return mapper.insertUsageStatus(vo);
    }

    @Override
    @Transactional
    public int updateUsageStatus(PrkUsageStatusVO vo) {
        return mapper.updateUsageStatus(vo);
    }

    @Override
    @Transactional
    public int deleteUsageStatus(PrkUsageStatusVO vo) {
        return mapper.deleteUsageStatus(vo);
    }
}
