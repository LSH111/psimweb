package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoZipService;
import com.psim.web.cmm.vo.CoZipVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/co-zips")
public class CoZipController {

    @Autowired
    private CoZipService coZipService;

    @GetMapping
    public List<CoZipVO> getAllZips() {
        return coZipService.getAllCoZips();
    }

    @GetMapping("/{zip}/{zipSeq}")
    public CoZipVO getZipById(@PathVariable String zip, @PathVariable Integer zipSeq) {
        return coZipService.getCoZipById(zip, zipSeq);
    }

    @PostMapping
    public void addZip(@RequestBody CoZipVO zip) {
        coZipService.addCoZip(zip);
    }

    @PutMapping("/{zip}/{zipSeq}")
    public void editZip(@PathVariable String zip, @PathVariable Integer zipSeq, @RequestBody CoZipVO zipVo) {
        zipVo.setZip(zip);
        zipVo.setZipSeq(zipSeq);
        coZipService.editCoZip(zipVo);
    }

    @DeleteMapping("/{zip}/{zipSeq}")
    public void removeZip(@PathVariable String zip, @PathVariable Integer zipSeq) {
        coZipService.removeCoZip(zip, zipSeq);
    }
}
