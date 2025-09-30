package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoAuthService;
import com.psim.web.cmm.vo.CoAuthVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/co-auths")
public class CoAuthController {

    @Autowired
    private CoAuthService coAuthService;

    @GetMapping
    public List<CoAuthVO> getAllAuths() {
        return coAuthService.getAllCoAuths();
    }

    @GetMapping("/{authCd}")
    public CoAuthVO getAuthById(@PathVariable String authCd) {
        return coAuthService.getCoAuthById(authCd);
    }

    @PostMapping
    public void addAuth(@RequestBody CoAuthVO auth) {
        coAuthService.addCoAuth(auth);
    }

    @PutMapping("/{authCd}")
    public void editAuth(@PathVariable String authCd, @RequestBody CoAuthVO auth) {
        auth.setAuthCd(authCd);
        coAuthService.editCoAuth(auth);
    }

    @DeleteMapping("/{authCd}")
    public void removeAuth(@PathVariable String authCd) {
        coAuthService.removeCoAuth(authCd);
    }
}
