package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoMenuMapper;
import com.psim.web.cmm.service.CoMenuService;
import com.psim.web.cmm.vo.CoMenuVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CoMenuServiceImpl implements CoMenuService {

    @Autowired
    private CoMenuMapper coMenuMapper;

    @Override
    public List<CoMenuVO> getAllMenus() {
        return coMenuMapper.selectAllCoMenus();
    }

    @Override
    public CoMenuVO getMenuById(String menuCd) {
        return coMenuMapper.selectCoMenuById(menuCd);
    }

    @Override
    public void addMenu(CoMenuVO menu) {
        coMenuMapper.insertCoMenu(menu);
    }

    @Override
    public void editMenu(CoMenuVO menu) {
        coMenuMapper.updateCoMenu(menu);
    }

    @Override
    public void removeMenu(String menuCd) {
        coMenuMapper.deleteCoMenu(menuCd);
    }
}
