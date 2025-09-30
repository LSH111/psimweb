package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoAuthMenuMapper;
import com.psim.web.cmm.service.CoAuthMenuService;
import com.psim.web.cmm.vo.CoAuthMenuVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CoAuthMenuServiceImpl implements CoAuthMenuService {

    @Autowired
    private CoAuthMenuMapper coAuthMenuMapper;

    @Override
    public List<CoAuthMenuVO> getAllCoAuthMenus() {
        return coAuthMenuMapper.selectAllCoAuthMenus();
    }

    @Override
    public CoAuthMenuVO getCoAuthMenuById(String authCd, String menuCd) {
        return coAuthMenuMapper.selectCoAuthMenuById(authCd, menuCd);
    }

    @Override
    public void addCoAuthMenu(CoAuthMenuVO authMenu) {
        coAuthMenuMapper.insertCoAuthMenu(authMenu);
    }

    @Override
    public void editCoAuthMenu(CoAuthMenuVO authMenu) {
        coAuthMenuMapper.updateCoAuthMenu(authMenu);
    }

    @Override
    public void removeCoAuthMenu(String authCd, String menuCd) {
        coAuthMenuMapper.deleteCoAuthMenu(authCd, menuCd);
    }
}
