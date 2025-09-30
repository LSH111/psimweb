package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoMenuService;
import com.psim.web.cmm.vo.CoMenuVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/menus")
public class CoMenuController {

    @Autowired
    private CoMenuService coMenuService;

    @GetMapping
    public List<CoMenuVO> getAllMenus() {
        return coMenuService.getAllMenus();
    }

    @GetMapping("/{menuCd}")
    public CoMenuVO getMenuById(@PathVariable String menuCd) {
        return coMenuService.getMenuById(menuCd);
    }

    @PostMapping
    public void addMenu(@RequestBody CoMenuVO menu) {
        coMenuService.addMenu(menu);
    }

    @PutMapping("/{menuCd}")
    public void editMenu(@PathVariable String menuCd, @RequestBody CoMenuVO menu) {
        menu.setMenuCd(menuCd);
        coMenuService.editMenu(menu);
    }

    @DeleteMapping("/{menuCd}")
    public void removeMenu(@PathVariable String menuCd) {
        coMenuService.removeMenu(menuCd);
    }
}
