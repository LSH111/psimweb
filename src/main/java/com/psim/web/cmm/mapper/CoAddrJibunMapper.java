package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoAddrJibunVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CoAddrJibunMapper {
    List<CoAddrJibunVO> selectAllCoAddrJibuns();
    CoAddrJibunVO selectCoAddrJibunById(String manageNo);
    void insertCoAddrJibun(CoAddrJibunVO addrJibun);
    void updateCoAddrJibun(CoAddrJibunVO addrJibun);
    void deleteCoAddrJibun(String manageNo);
}
