
package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoAddrService;
import com.psim.web.cmm.vo.CoAddrVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/co-addrs")
public class CoAddrController {

    @Autowired
    private CoAddrService coAddrService;

    @GetMapping
    public List<CoAddrVO> getAllAddrs() {
        return coAddrService.getAllCoAddrs();
    }

    @GetMapping("/{manageNo}")
    public CoAddrVO getAddrById(@PathVariable String manageNo) {
        return coAddrService.getCoAddrById(manageNo);
    }

    @PostMapping
    public void addAddr(@RequestBody CoAddrVO addr) {
        coAddrService.addCoAddr(addr);
    }

    @PutMapping("/{manageNo}")
    public void editAddr(@PathVariable String manageNo, @RequestBody CoAddrVO addr) {
        addr.setManageNo(manageNo);
        coAddrService.editCoAddr(addr);
    }

    @DeleteMapping("/{manageNo}")
    public void removeAddr(@PathVariable String manageNo) {
        coAddrService.removeCoAddr(manageNo);
    }
}
