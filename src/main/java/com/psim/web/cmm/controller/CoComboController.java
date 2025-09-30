package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoComboService;
import com.psim.web.cmm.vo.CoComboVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/co-combos")
public class CoComboController {

    @Autowired
    private CoComboService coComboService;

    @GetMapping
    public List<CoComboVO> getAllCombos() {
        return coComboService.getAllCoCombos();
    }

    @GetMapping("/{comboType}/{comboCd}")
    public CoComboVO getComboById(@PathVariable String comboType, @PathVariable String comboCd) {
        return coComboService.getCoComboById(comboType, comboCd);
    }

    @PostMapping
    public void addCombo(@RequestBody CoComboVO combo) {
        coComboService.addCoCombo(combo);
    }

    @PutMapping("/{comboType}/{comboCd}")
    public void editCombo(@PathVariable String comboType, @PathVariable String comboCd, @RequestBody CoComboVO combo) {
        combo.setComboType(comboType);
        combo.setComboCd(comboCd);
        coComboService.editCoCombo(combo);
    }

    @DeleteMapping("/{comboType}/{comboCd}")
    public void removeCombo(@PathVariable String comboType, @PathVariable String comboCd) {
        coComboService.removeCoCombo(comboType, comboCd);
    }
}
