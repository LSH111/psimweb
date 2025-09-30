package com.psim.web.prk.controller;

import com.psim.web.prk.service.OffstrPrklotInfoService;
import com.psim.web.prk.vo.OffstrPrklotInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/offstr-prklot-infos")
public class OffstrPrklotInfoController {

    @Autowired
    private OffstrPrklotInfoService offstrPrklotInfoService;

    @GetMapping
    public List<OffstrPrklotInfoVO> getAllInfos() {
        return offstrPrklotInfoService.getAllOffstrPrklotInfos();
    }

    @GetMapping("/{prkPlceInfoSn}")
    public OffstrPrklotInfoVO getInfoById(@PathVariable Integer prkPlceInfoSn) {
        return offstrPrklotInfoService.getOffstrPrklotInfoById(prkPlceInfoSn);
    }

    @PostMapping
    public void addInfo(@RequestBody OffstrPrklotInfoVO info) {
        offstrPrklotInfoService.addOffstrPrklotInfo(info);
    }

    @PutMapping("/{prkPlceInfoSn}")
    public void editInfo(@PathVariable Integer prkPlceInfoSn, @RequestBody OffstrPrklotInfoVO info) {
        info.setPrkPlceInfoSn(prkPlceInfoSn);
        offstrPrklotInfoService.editOffstrPrklotInfo(info);
    }

    @DeleteMapping("/{prkPlceInfoSn}")
    public void removeInfo(@PathVariable Integer prkPlceInfoSn) {
        offstrPrklotInfoService.removeOffstrPrklotInfo(prkPlceInfoSn);
    }
}
