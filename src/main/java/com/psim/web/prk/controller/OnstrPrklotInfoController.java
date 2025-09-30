package com.psim.web.prk.controller;

import com.psim.web.prk.service.OnstrPrklotInfoService;
import com.psim.web.prk.vo.OnstrPrklotInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/onstr-prklot-infos")
public class OnstrPrklotInfoController {

    @Autowired
    private OnstrPrklotInfoService onstrPrklotInfoService;

    @GetMapping
    public List<OnstrPrklotInfoVO> getAllInfos() {
        return onstrPrklotInfoService.getAllOnstrPrklotInfos();
    }

    @GetMapping("/{prkPlceInfoSn}")
    public OnstrPrklotInfoVO getInfoById(@PathVariable Integer prkPlceInfoSn) {
        return onstrPrklotInfoService.getOnstrPrklotInfoById(prkPlceInfoSn);
    }

    @PostMapping
    public void addInfo(@RequestBody OnstrPrklotInfoVO info) {
        onstrPrklotInfoService.addOnstrPrklotInfo(info);
    }

    @PutMapping("/{prkPlceInfoSn}")
    public void editInfo(@PathVariable Integer prkPlceInfoSn, @RequestBody OnstrPrklotInfoVO info) {
        info.setPrkPlceInfoSn(prkPlceInfoSn);
        onstrPrklotInfoService.editOnstrPrklotInfo(info);
    }

    @DeleteMapping("/{prkPlceInfoSn}")
    public void removeInfo(@PathVariable Integer prkPlceInfoSn) {
        onstrPrklotInfoService.removeOnstrPrklotInfo(prkPlceInfoSn);
    }
}
