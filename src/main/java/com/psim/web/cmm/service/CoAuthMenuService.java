package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoAuthMenuVO;
import java.util.List;

public interface CoAuthMenuService {
    List<CoAuthMenuVO> getAllCoAuthMenus();
    CoAuthMenuVO getCoAuthMenuById(String authCd, String menuCd);
    void addCoAuthMenu(CoAuthMenuVO authMenu);
    void editCoAuthMenu(CoAuthMenuVO authMenu);
    void removeCoAuthMenu(String authCd, String menuCd);
}
