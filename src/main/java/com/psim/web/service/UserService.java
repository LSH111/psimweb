package com.psim.web.service;

import com.psim.web.vo.UserVO;

public interface UserService {
    UserVO login(String username, String password);
}
