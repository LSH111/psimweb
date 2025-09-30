package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoAuthVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CoAuthMapper {
    List<CoAuthVO> selectAllCoAuths();
    CoAuthVO selectCoAuthById(String authCd);
    void insertCoAuth(CoAuthVO auth);
    void updateCoAuth(CoAuthVO auth);
    void deleteCoAuth(String authCd);
}
