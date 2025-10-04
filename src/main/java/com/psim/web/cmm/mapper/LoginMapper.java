package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoUserVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

public interface LoginMapper {
    CoUserVO login(@Param("userId") String userId,
                   @Param("password") String password);
}
