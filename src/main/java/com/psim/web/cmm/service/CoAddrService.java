package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoAddrVO;
import java.util.List;

public interface CoAddrService {
    List<CoAddrVO> getAllCoAddrs();
    CoAddrVO getCoAddrById(String manageNo);
    void addCoAddr(CoAddrVO addr);
    void editCoAddr(CoAddrVO addr);
    void removeCoAddr(String manageNo);
}
