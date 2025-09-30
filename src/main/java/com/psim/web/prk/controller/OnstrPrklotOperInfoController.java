package com.psim.web.prk.controller;

import com.psim.web.prk.service.OnstrPrklotOperInfoService;
import com.psim.web.prk.vo.OnstrPrklotOperInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/onstr-prklot-oper-infos")
public class OnstrPrklotOperInfoController {

    @Autowired
    private OnstrPrklotOperInfoService onstrPrklotOperInfoService;

    @GetMapping
    public List<OnstrPrklotOperInfoVO> getAllInfos() {
        return onstrPrklotOperInfoService.getAllOnstrPrklotOperInfos();
    }

    @GetMapping("/{operInfoSn}")
    public OnstrPrklotOperInfoVO getInfoById(@PathVariable Integer operInfoSn) {
        return onstrPrklotOperInfoService.getOnstrPrklotOperInfoById(operInfoSn);
    }

    @PostMapping
    public void addInfo(@RequestBody OnstrPrklotOperInfoVO info) {
        onstrPrklotOperInfoService.addOnstrPrklotOperInfo(info);
    }

    @PutMapping("/{operInfoSn}")
    public void editInfo(@PathVariable Integer operInfoSn, @RequestBody OnstrPrklotOperInfoVO info) {
        info.setOperInfoSn(operInfoSn);
        onstrPrklotOperInfoService.editOnstrPrklotOperInfo(info);
    }

    @DeleteMapping("/{operInfoSn}")
    public void removeInfo(@PathVariable Integer operInfoSn) {
        onstrPrklotOperInfoService.removeOnstrPrklotOperInfo(operInfoSn);
    }
}
