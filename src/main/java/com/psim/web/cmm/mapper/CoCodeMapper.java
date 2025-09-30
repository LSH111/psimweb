package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoCodeVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CoCodeMapper {
    List<CoCodeVO> selectAllCoCodes();
    CoCodeVO selectCoCodeById(String groupCd, String commonCd);
    void insertCoCode(CoCodeVO code);
    void updateCoCode(CoCodeVO code);
    void deleteCoCode(String groupCd, String commonCd);
}
