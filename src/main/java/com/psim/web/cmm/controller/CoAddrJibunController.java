package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoAddrJibunService;
import com.psim.web.cmm.vo.CoAddrJibunVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/co-addr-jibuns")
public class CoAddrJibunController {

    @Autowired
    private CoAddrJibunService coAddrJibunService;

    @GetMapping
    public List<CoAddrJibunVO> getAllAddrJibuns() {
        return coAddrJibunService.getAllCoAddrJibuns();
    }

    @GetMapping("/{manageNo}")
    public CoAddrJibunVO getAddrJibunById(@PathVariable String manageNo) {
        return coAddrJibunService.getCoAddrJibunById(manageNo);
    }

    @PostMapping
    public void addAddrJibun(@RequestBody CoAddrJibunVO addrJibun) {
        coAddrJibunService.addCoAddrJibun(addrJibun);
    }

    @PutMapping("/{manageNo}")
    public void editAddrJibun(@PathVariable String manageNo, @RequestBody CoAddrJibunVO addrJibun) {
        addrJibun.setManageNo(manageNo);
        coAddrJibunService.editCoAddrJibun(addrJibun);
    }

    @DeleteMapping("/{manageNo}")
    public void removeAddrJibun(@PathVariable String manageNo) {
        coAddrJibunService.removeCoAddrJibun(manageNo);
    }
}
