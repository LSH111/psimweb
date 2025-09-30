package com.psim.web.prk.controller;

import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.PrkDefPlceInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/prk-def-plce-infos")
public class PrkDefPlceInfoController {

    @Autowired
    private PrkDefPlceInfoService prkDefPlceInfoService;

    @GetMapping
    public List<PrkDefPlceInfoVO> getAllInfos() {
        return prkDefPlceInfoService.getAllPrkDefPlceInfos();
    }

    @GetMapping("/{prkPlceInfoSn}")
    public PrkDefPlceInfoVO getInfoById(@PathVariable Integer prkPlceInfoSn) {
        return prkDefPlceInfoService.getPrkDefPlceInfoById(prkPlceInfoSn);
    }

    @PostMapping
    public void addInfo(@RequestBody PrkDefPlceInfoVO info) {
        prkDefPlceInfoService.addPrkDefPlceInfo(info);
    }

    @PutMapping("/{prkPlceInfoSn}")
    public void editInfo(@PathVariable Integer prkPlceInfoSn, @RequestBody PrkDefPlceInfoVO info) {
        info.setPrkPlceInfoSn(prkPlceInfoSn);
        prkDefPlceInfoService.editPrkDefPlceInfo(info);
    }

    @DeleteMapping("/{prkPlceInfoSn}")
    public void removeInfo(@PathVariable Integer prkPlceInfoSn) {
        prkDefPlceInfoService.removePrkDefPlceInfo(prkPlceInfoSn);
    }
}
