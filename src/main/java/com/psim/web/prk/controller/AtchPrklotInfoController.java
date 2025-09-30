package com.psim.web.prk.controller;

import com.psim.web.prk.service.AtchPrklotInfoService;
import com.psim.web.prk.vo.AtchPrklotInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/atch-prklot-infos")
public class AtchPrklotInfoController {

    @Autowired
    private AtchPrklotInfoService atchPrklotInfoService;

    @GetMapping
    public List<AtchPrklotInfoVO> getAllInfos() {
        return atchPrklotInfoService.getAllAtchPrklotInfos();
    }

    @GetMapping("/{prkPlceInfoSn}")
    public AtchPrklotInfoVO getInfoById(@PathVariable Integer prkPlceInfoSn) {
        return atchPrklotInfoService.getAtchPrklotInfoById(prkPlceInfoSn);
    }

    @PostMapping
    public void addInfo(@RequestBody AtchPrklotInfoVO info) {
        atchPrklotInfoService.addAtchPrklotInfo(info);
    }

    @PutMapping("/{prkPlceInfoSn}")
    public void editInfo(@PathVariable Integer prkPlceInfoSn, @RequestBody AtchPrklotInfoVO info) {
        info.setPrkPlceInfoSn(prkPlceInfoSn);
        atchPrklotInfoService.editAtchPrklotInfo(info);
    }

    @DeleteMapping("/{prkPlceInfoSn}")
    public void removeInfo(@PathVariable Integer prkPlceInfoSn) {
        atchPrklotInfoService.removeAtchPrklotInfo(prkPlceInfoSn);
    }
}
