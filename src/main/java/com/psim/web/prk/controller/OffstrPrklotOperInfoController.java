package com.psim.web.prk.controller;

import com.psim.web.prk.service.OffstrPrklotOperInfoService;
import com.psim.web.prk.vo.OffstrPrklotOperInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/offstr-prklot-oper-infos")
public class OffstrPrklotOperInfoController {

    @Autowired
    private OffstrPrklotOperInfoService offstrPrklotOperInfoService;

    @GetMapping
    public List<OffstrPrklotOperInfoVO> getAllInfos() {
        return offstrPrklotOperInfoService.getAllOffstrPrklotOperInfos();
    }

    @GetMapping("/{operInfoSn}")
    public OffstrPrklotOperInfoVO getInfoById(@PathVariable Integer operInfoSn) {
        return offstrPrklotOperInfoService.getOffstrPrklotOperInfoById(operInfoSn);
    }

    @PostMapping
    public void addInfo(@RequestBody OffstrPrklotOperInfoVO info) {
        offstrPrklotOperInfoService.addOffstrPrklotOperInfo(info);
    }

    @PutMapping("/{operInfoSn}")
    public void editInfo(@PathVariable Integer operInfoSn, @RequestBody OffstrPrklotOperInfoVO info) {
        info.setOperInfoSn(operInfoSn);
        offstrPrklotOperInfoService.editOffstrPrklotOperInfo(info);
    }

    @DeleteMapping("/{operInfoSn}")
    public void removeInfo(@PathVariable Integer operInfoSn) {
        offstrPrklotOperInfoService.removeOffstrPrklotOperInfo(operInfoSn);
    }
}
