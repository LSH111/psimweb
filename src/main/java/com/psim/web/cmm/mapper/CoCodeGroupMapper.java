package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoCodeGroupVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CoCodeGroupMapper {
    List<CoCodeGroupVO> selectAllCoCodeGroups();
    CoCodeGroupVO selectCoCodeGroupById(String groupCd);
    void insertCoCodeGroup(CoCodeGroupVO codeGroup);
    void updateCoCodeGroup(CoCodeGroupVO codeGroup);
    void deleteCoCodeGroup(String groupCd);
}
