package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoAuthTargetVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CoAuthTargetMapper {
    List<CoAuthTargetVO> selectAllCoAuthTargets();
    CoAuthTargetVO selectCoAuthTargetById(String authCd, String userCd);
    void insertCoAuthTarget(CoAuthTargetVO authTarget);
    void updateCoAuthTarget(CoAuthTargetVO authTarget);
    void deleteCoAuthTarget(String authCd, String userCd);
}
