package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoMenuVO;
import java.util.List;

public interface CoMenuService {
    List<CoMenuVO> getAllMenus();
    CoMenuVO getMenuById(String menuCd);
    void addMenu(CoMenuVO menu);
    void editMenu(CoMenuVO menu);
    void removeMenu(String menuCd);
}
