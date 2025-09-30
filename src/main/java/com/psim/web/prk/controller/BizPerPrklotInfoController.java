package com.psim.web.prk.controller;

import com.psim.web.prk.service.BizPerPrklotInfoService;
import com.psim.web.prk.vo.BizPerPrklotInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/biz-per-prklot-infos")
public class BizPerPrklotInfoController {

    @Autowired
    private BizPerPrklotInfoService bizPerPrklotInfoService;

    @GetMapping
    public List<BizPerPrklotInfoVO> getAllInfos() {
        return bizPerPrklotInfoService.getAllBizPerPrklotInfos();
    }

    @GetMapping("/{bizInfoSn}")
    public BizPerPrklotInfoVO getInfoById(@PathVariable Integer bizInfoSn) {
        return bizPerPrklotInfoService.getBizPerPrklotInfoById(bizInfoSn);
    }

    @PostMapping
    public void addInfo(@RequestBody BizPerPrklotInfoVO info) {
        bizPerPrklotInfoService.addBizPerPrklotInfo(info);
    }

    @PutMapping("/{bizInfoSn}")
    public void editInfo(@PathVariable Integer bizInfoSn, @RequestBody BizPerPrklotInfoVO info) {
        info.setBizInfoSn(bizInfoSn);
        bizPerPrklotInfoService.editBizPerPrklotInfo(info);
    }

    @DeleteMapping("/{bizInfoSn}")
    public void removeInfo(@PathVariable Integer bizInfoSn) {
        bizPerPrklotInfoService.removeBizPerPrklotInfo(bizInfoSn);
    }
}
