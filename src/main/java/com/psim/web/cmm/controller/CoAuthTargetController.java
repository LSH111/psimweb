package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoAuthTargetService;
import com.psim.web.cmm.vo.CoAuthTargetVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/co-auth-targets")
public class CoAuthTargetController {

    @Autowired
    private CoAuthTargetService coAuthTargetService;

    @GetMapping
    public List<CoAuthTargetVO> getAllAuthTargets() {
        return coAuthTargetService.getAllCoAuthTargets();
    }

    @GetMapping("/{authCd}/{userCd}")
    public CoAuthTargetVO getAuthTargetById(@PathVariable String authCd, @PathVariable String userCd) {
        return coAuthTargetService.getCoAuthTargetById(authCd, userCd);
    }

    @PostMapping
    public void addAuthTarget(@RequestBody CoAuthTargetVO authTarget) {
        coAuthTargetService.addCoAuthTarget(authTarget);
    }

    @PutMapping("/{authCd}/{userCd}")
    public void editAuthTarget(@PathVariable String authCd, @PathVariable String userCd, @RequestBody CoAuthTargetVO authTarget) {
        authTarget.setAuthCd(authCd);
        authTarget.setUserCd(userCd);
        coAuthTargetService.editCoAuthTarget(authTarget);
    }

    @DeleteMapping("/{authCd}/{userCd}")
    public void removeAuthTarget(@PathVariable String authCd, @PathVariable String userCd) {
        coAuthTargetService.removeCoAuthTarget(authCd, userCd);
    }
}
