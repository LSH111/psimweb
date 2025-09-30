package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoAddrVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CoAddrMapper {
    List<CoAddrVO> selectAllCoAddrs();
    CoAddrVO selectCoAddrById(String manageNo);
    void insertCoAddr(CoAddrVO addr);
    void updateCoAddr(CoAddrVO addr);
    void deleteCoAddr(String manageNo);
}
