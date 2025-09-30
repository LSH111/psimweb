package com.psim.web.api.controller;

import com.psim.web.api.service.PrkApiInfoService;
import com.psim.web.api.vo.PrkApiInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/prk-api-infos")
public class PrkApiInfoController {

    @Autowired
    private PrkApiInfoService prkApiInfoService;

    @GetMapping
    public List<PrkApiInfoVO> getAllInfos() {
        return prkApiInfoService.getAllPrkApiInfos();
    }

    @GetMapping("/{apiInfoSn}")
    public PrkApiInfoVO getInfoById(@PathVariable Integer apiInfoSn) {
        return prkApiInfoService.getPrkApiInfoById(apiInfoSn);
    }

    @PostMapping
    public void addInfo(@RequestBody PrkApiInfoVO info) {
        prkApiInfoService.addPrkApiInfo(info);
    }

    @PutMapping("/{apiInfoSn}")
    public void editInfo(@PathVariable Integer apiInfoSn, @RequestBody PrkApiInfoVO info) {
        info.setApiInfoSn(apiInfoSn);
        prkApiInfoService.editPrkApiInfo(info);
    }

    @DeleteMapping("/{apiInfoSn}")
    public void removeInfo(@PathVariable Integer apiInfoSn) {
        prkApiInfoService.removePrkApiInfo(apiInfoSn);
    }
}
