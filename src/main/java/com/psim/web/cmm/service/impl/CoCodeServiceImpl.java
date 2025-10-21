
package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoCodeMapper;
import com.psim.web.cmm.service.CoCodeService;
import com.psim.web.cmm.vo.CoCodeVO;
import com.psim.web.cmm.vo.CoLdongVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CoCodeServiceImpl implements CoCodeService {
    
    private final CoCodeMapper coCodeMapper;
    
    @Override
    public List<CoCodeVO> getCodeListByGroup(String groupCd) {
        return coCodeMapper.selectCodeListByGroup(groupCd);
    }
    
    @Override
    public List<CoCodeVO> getSubCodeList(Map<String, Object> params) {
        return coCodeMapper.selectSubCodeList(params);
    }

    @Override
    public List<CoLdongVO> getLdongList(String sigunguCd) {
        return coCodeMapper.selectLdongList(sigunguCd);
    }
}
