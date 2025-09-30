package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoUserVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CoUserMapper {
    List<CoUserVO> selectAllUsers();
    CoUserVO selectUserById(String userId);
    void insertUser(CoUserVO user);
    void updateUser(CoUserVO user);
    void deleteUser(String userId);

    CoUserVO selectCoUserById(String userId);
}