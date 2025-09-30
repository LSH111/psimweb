package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoCodeMapper;
import com.psim.web.cmm.service.CoCodeService;
import com.psim.web.cmm.vo.CoCodeVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CoCodeServiceImpl implements CoCodeService {

    @Autowired
    private CoCodeMapper coCodeMapper;

    @Override
    public List<CoCodeVO> getAllCodes() {
        return coCodeMapper.selectAllCoCodes();
    }

    @Override
    public CoCodeVO getCodeById(String groupCd, String commonCd) {
        return coCodeMapper.selectCoCodeById(groupCd, commonCd);
    }

    @Override
    public void addCode(CoCodeVO code) {
        coCodeMapper.insertCoCode(code);
    }

    @Override
    public void editCode(CoCodeVO code) {
        coCodeMapper.updateCoCode(code);
    }

    @Override
    public void removeCode(String groupCd, String commonCd) {
        coCodeMapper.deleteCoCode(groupCd, commonCd);
    }
}
