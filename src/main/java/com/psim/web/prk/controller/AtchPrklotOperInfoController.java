package com.psim.web.prk.controller;

import com.psim.web.prk.service.AtchPrklotOperInfoService;
import com.psim.web.prk.vo.AtchPrklotOperInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/atch-prklot-oper-infos")
public class AtchPrklotOperInfoController {

    @Autowired
    private AtchPrklotOperInfoService atchPrklotOperInfoService;

    @GetMapping
    public List<AtchPrklotOperInfoVO> getAllInfos() {
        return atchPrklotOperInfoService.getAllAtchPrklotOperInfos();
    }

    @GetMapping("/{operInfoSn}")
    public AtchPrklotOperInfoVO getInfoById(@PathVariable Integer operInfoSn) {
        return atchPrklotOperInfoService.getAtchPrklotOperInfoById(operInfoSn);
    }

    @PostMapping
    public void addInfo(@RequestBody AtchPrklotOperInfoVO info) {
        atchPrklotOperInfoService.addAtchPrklotOperInfo(info);
    }

    @PutMapping("/{operInfoSn}")
    public void editInfo(@PathVariable Integer operInfoSn, @RequestBody AtchPrklotOperInfoVO info) {
        info.setOperInfoSn(operInfoSn);
        atchPrklotOperInfoService.editAtchPrklotOperInfo(info);
    }

    @DeleteMapping("/{operInfoSn}")
    public void removeInfo(@PathVariable Integer operInfoSn) {
        atchPrklotOperInfoService.removeAtchPrklotOperInfo(operInfoSn);
    }
}
