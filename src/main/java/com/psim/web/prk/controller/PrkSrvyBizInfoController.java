package com.psim.web.prk.controller;

import com.psim.web.prk.service.PrkSrvyBizInfoService;
import com.psim.web.prk.vo.PrkSrvyBizInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/prk-srvy-biz-infos")
public class PrkSrvyBizInfoController {

    @Autowired
    private PrkSrvyBizInfoService prkSrvyBizInfoService;

    @GetMapping
    public List<PrkSrvyBizInfoVO> getAllInfos() {
        return prkSrvyBizInfoService.getAllPrkSrvyBizInfos();
    }

    @GetMapping("/{bizSurveySn}")
    public PrkSrvyBizInfoVO getInfoById(@PathVariable Integer bizSurveySn) {
        return prkSrvyBizInfoService.getPrkSrvyBizInfoById(bizSurveySn);
    }

    @PostMapping
    public void addInfo(@RequestBody PrkSrvyBizInfoVO info) {
        prkSrvyBizInfoService.addPrkSrvyBizInfo(info);
    }

    @PutMapping("/{bizSurveySn}")
    public void editInfo(@PathVariable Integer bizSurveySn, @RequestBody PrkSrvyBizInfoVO info) {
        info.setBizSurveySn(bizSurveySn);
        prkSrvyBizInfoService.editPrkSrvyBizInfo(info);
    }

    @DeleteMapping("/{bizSurveySn}")
    public void removeInfo(@PathVariable Integer bizSurveySn) {
        prkSrvyBizInfoService.removePrkSrvyBizInfo(bizSurveySn);
    }
}
