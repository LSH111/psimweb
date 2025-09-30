package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoAuthMenuVO;
import java.util.List;

public interface CoAuthMenuMapper {
    List<CoAuthMenuVO> selectAllCoAuthMenus();
    CoAuthMenuVO selectCoAuthMenuById(String authCd, String menuCd);
    void insertCoAuthMenu(CoAuthMenuVO authMenu);
    void updateCoAuthMenu(CoAuthMenuVO authMenu);
    void deleteCoAuthMenu(String authCd, String menuCd);
}
