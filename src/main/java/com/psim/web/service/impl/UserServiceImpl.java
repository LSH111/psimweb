package com.psim.web.service.impl;

import com.psim.web.mapper.UserMapper;
import com.psim.web.service.UserService;
import com.psim.web.vo.UserVO;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public UserVO login(String username, String password) {
        UserVO user = userMapper.findByUsername(username);
        if(user == null) return null;
        return password != null && password.equals(user.getPassword()) ? user : null;
    }
}
