package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoMenuVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CoMenuMapper {
    List<CoMenuVO> selectAllCoMenus();
    CoMenuVO selectCoMenuById(String menuCd);
    void insertCoMenu(CoMenuVO menu);
    void updateCoMenu(CoMenuVO menu);
    void deleteCoMenu(String menuCd);
}
