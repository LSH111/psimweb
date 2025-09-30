package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoUserVO;
import java.util.List;

public interface CoUserService {
    List<CoUserVO> getAllUsers();
    CoUserVO getUserById(String userId);
    void addUser(CoUserVO user);
    void editUser(CoUserVO user);
    void removeUser(String userId);
}
