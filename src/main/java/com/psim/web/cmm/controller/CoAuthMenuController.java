package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoAuthMenuService;
import com.psim.web.cmm.vo.CoAuthMenuVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/co-auth-menus")
public class CoAuthMenuController {

    @Autowired
    private CoAuthMenuService coAuthMenuService;

    @GetMapping
    public List<CoAuthMenuVO> getAllAuthMenus() {
        return coAuthMenuService.getAllCoAuthMenus();
    }

    @GetMapping("/{authCd}/{menuCd}")
    public CoAuthMenuVO getAuthMenuById(@PathVariable String authCd, @PathVariable String menuCd) {
        return coAuthMenuService.getCoAuthMenuById(authCd, menuCd);
    }

    @PostMapping
    public void addAuthMenu(@RequestBody CoAuthMenuVO authMenu) {
        coAuthMenuService.addCoAuthMenu(authMenu);
    }

    @PutMapping("/{authCd}/{menuCd}")
    public void editAuthMenu(@PathVariable String authCd, @PathVariable String menuCd, @RequestBody CoAuthMenuVO authMenu) {
        authMenu.setAuthCd(authCd);
        authMenu.setMenuCd(menuCd);
        coAuthMenuService.editCoAuthMenu(authMenu);
    }

    @DeleteMapping("/{authCd}/{menuCd}")
    public void removeAuthMenu(@PathVariable String authCd, @PathVariable String menuCd) {
        coAuthMenuService.removeCoAuthMenu(authCd, menuCd);
    }
}
