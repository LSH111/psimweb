package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoCodeService;
import com.psim.web.cmm.vo.CoCodeVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/codes")
public class CoCodeController {

    @Autowired
    private CoCodeService coCodeService;

    @GetMapping
    public List<CoCodeVO> getAllCodes() {
        return coCodeService.getAllCodes();
    }

    @GetMapping("/{groupCd}/{commonCd}")
    public CoCodeVO getCodeById(@PathVariable String groupCd, @PathVariable String commonCd) {
        return coCodeService.getCodeById(groupCd, commonCd);
    }

    @PostMapping
    public void addCode(@RequestBody CoCodeVO code) {
        coCodeService.addCode(code);
    }

    @PutMapping("/{groupCd}/{commonCd}")
    public void editCode(@PathVariable String groupCd, @PathVariable String commonCd, @RequestBody CoCodeVO code) {
        code.setGroupCd(groupCd);
        code.setCommonCd(commonCd);
        coCodeService.editCode(code);
    }

    @DeleteMapping("/{groupCd}/{commonCd}")
    public void removeCode(@PathVariable String groupCd, @PathVariable String commonCd) {
        coCodeService.removeCode(groupCd, commonCd);
    }
}
