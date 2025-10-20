package com.psim.web.file.controller;

import com.psim.web.file.service.AttchPicMngInfoService;
import com.psim.web.file.vo.AttchPicMngInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attch-pic-mng-infos")
public class AttchPicMngInfoController {

    @Autowired
    private AttchPicMngInfoService attchPicMngInfoService;

    @GetMapping
    public List<AttchPicMngInfoVO> getAllInfos() {
        return attchPicMngInfoService.getAllAttchPicMngInfos();
    }

    @GetMapping("/{picMngSn}")
    public AttchPicMngInfoVO getInfoById(@PathVariable Integer picMngSn) {
        return attchPicMngInfoService.getAttchPicMngInfoById(picMngSn);
    }

    @PostMapping
    public void addInfo(@RequestBody AttchPicMngInfoVO info) {
        attchPicMngInfoService.addAttchPicMngInfo(info);
    }

    @PutMapping("/{picMngSn}")
    public void editInfo(@PathVariable Integer picMngSn, @RequestBody AttchPicMngInfoVO info) {
        info.setPicMngSn(picMngSn);
        attchPicMngInfoService.editAttchPicMngInfo(info);
    }

    @DeleteMapping("/{picMngSn}")
    public void removeInfo(@PathVariable Integer picMngSn) {
        attchPicMngInfoService.removeAttchPicMngInfo(picMngSn);
    }
}
