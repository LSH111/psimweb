package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoUserMapper;
import com.psim.web.cmm.service.CoUserService;
import com.psim.web.cmm.vo.CoUserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CoUserServiceImpl implements CoUserService {

    @Autowired
    private CoUserMapper coUserMapper;

    @Override
    public List<CoUserVO> getAllUsers() {
        return coUserMapper.selectAllUsers();
    }

    @Override
    public CoUserVO getUserById(String userId) {
        return coUserMapper.selectUserById(userId);
    }

    @Override
    public void addUser(CoUserVO user) {
        coUserMapper.insertUser(user);
    }

    @Override
    public void editUser(CoUserVO user) {
        coUserMapper.updateUser(user);
    }

    @Override
    public void removeUser(String userId) {
        coUserMapper.deleteUser(userId);
    }
}
