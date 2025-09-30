package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoCodeGroupVO;
import java.util.List;

public interface CoCodeGroupService {
    List<CoCodeGroupVO> getAllCoCodeGroups();
    CoCodeGroupVO getCoCodeGroupById(String groupCd);
    void addCoCodeGroup(CoCodeGroupVO codeGroup);
    void editCoCodeGroup(CoCodeGroupVO codeGroup);
    void removeCoCodeGroup(String groupCd);
}
