package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoAddrJibunVO;
import java.util.List;

public interface CoAddrJibunService {
    List<CoAddrJibunVO> getAllCoAddrJibuns();
    CoAddrJibunVO getCoAddrJibunById(String manageNo);
    void addCoAddrJibun(CoAddrJibunVO addrJibun);
    void editCoAddrJibun(CoAddrJibunVO addrJibun);
    void removeCoAddrJibun(String manageNo);
}
