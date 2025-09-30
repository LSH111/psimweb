package com.psim.web.mapper;

import com.psim.web.vo.UserVO;
import org.apache.ibatis.annotations.Param;

public interface UserMapper {
    UserVO findByUsername(@Param("username") String username);
}
