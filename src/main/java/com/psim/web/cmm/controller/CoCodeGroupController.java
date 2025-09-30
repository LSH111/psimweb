package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoCodeGroupService;
import com.psim.web.cmm.vo.CoCodeGroupVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/co-code-groups")
public class CoCodeGroupController {

    @Autowired
    private CoCodeGroupService coCodeGroupService;

    @GetMapping
    public List<CoCodeGroupVO> getAllCodeGroups() {
        return coCodeGroupService.getAllCoCodeGroups();
    }

    @GetMapping("/{groupCd}")
    public CoCodeGroupVO getCodeGroupById(@PathVariable String groupCd) {
        return coCodeGroupService.getCoCodeGroupById(groupCd);
    }

    @PostMapping
    public void addCodeGroup(@RequestBody CoCodeGroupVO codeGroup) {
        coCodeGroupService.addCoCodeGroup(codeGroup);
    }

    @PutMapping("/{groupCd}")
    public void editCodeGroup(@PathVariable String groupCd, @RequestBody CoCodeGroupVO codeGroup) {
        codeGroup.setGroupCd(groupCd);
        coCodeGroupService.editCoCodeGroup(codeGroup);
    }

    @DeleteMapping("/{groupCd}")
    public void removeCodeGroup(@PathVariable String groupCd) {
        coCodeGroupService.removeCoCodeGroup(groupCd);
    }
}
