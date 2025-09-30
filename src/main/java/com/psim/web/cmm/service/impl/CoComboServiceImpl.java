package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoComboMapper;
import com.psim.web.cmm.service.CoComboService;
import com.psim.web.cmm.vo.CoComboVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CoComboServiceImpl implements CoComboService {

    @Autowired
    private CoComboMapper coComboMapper;

    @Override
    public List<CoComboVO> getAllCoCombos() {
        return coComboMapper.selectAllCoCombos();
    }

    @Override
    public CoComboVO getCoComboById(String comboType, String comboCd) {
        return coComboMapper.selectCoComboById(comboType, comboCd);
    }

    @Override
    public void addCoCombo(CoComboVO combo) {
        coComboMapper.insertCoCombo(combo);
    }

    @Override
    public void editCoCombo(CoComboVO combo) {
        coComboMapper.updateCoCombo(combo);
    }

    @Override
    public void removeCoCombo(String comboType, String comboCd) {
        coComboMapper.deleteCoCombo(comboType, comboCd);
    }
}
