package com.psim.web.api.controller;

import com.psim.web.api.service.PrkApiKeyInfoService;
import com.psim.web.api.vo.PrkApiKeyInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/prk-api-key-infos")
public class PrkApiKeyInfoController {

    @Autowired
    private PrkApiKeyInfoService prkApiKeyInfoService;

    @GetMapping
    public List<PrkApiKeyInfoVO> getAllInfos() {
        return prkApiKeyInfoService.getAllPrkApiKeyInfos();
    }

    @GetMapping("/{apiKeySn}")
    public PrkApiKeyInfoVO getInfoById(@PathVariable Integer apiKeySn) {
        return prkApiKeyInfoService.getPrkApiKeyInfoById(apiKeySn);
    }

    @PostMapping
    public void addInfo(@RequestBody PrkApiKeyInfoVO info) {
        prkApiKeyInfoService.addPrkApiKeyInfo(info);
    }

    @PutMapping("/{apiKeySn}")
    public void editInfo(@PathVariable Integer apiKeySn, @RequestBody PrkApiKeyInfoVO info) {
        info.setApiKeySn(apiKeySn);
        prkApiKeyInfoService.editPrkApiKeyInfo(info);
    }

    @DeleteMapping("/{apiKeySn}")
    public void removeInfo(@PathVariable Integer apiKeySn) {
        prkApiKeyInfoService.removePrkApiKeyInfo(apiKeySn);
    }
}
