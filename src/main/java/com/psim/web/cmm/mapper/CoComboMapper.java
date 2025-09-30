package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoComboVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CoComboMapper {
    List<CoComboVO> selectAllCoCombos();
    CoComboVO selectCoComboById(String comboType, String comboCd);
    void insertCoCombo(CoComboVO combo);
    void updateCoCombo(CoComboVO combo);
    void deleteCoCombo(String comboType, String comboCd);
}
