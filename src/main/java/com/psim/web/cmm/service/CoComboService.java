package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoComboVO;
import java.util.List;

public interface CoComboService {
    List<CoComboVO> getAllCoCombos();
    CoComboVO getCoComboById(String comboType, String comboCd);
    void addCoCombo(CoComboVO combo);
    void editCoCombo(CoComboVO combo);
    void removeCoCombo(String comboType, String comboCd);
}
