package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoAuthTargetVO;
import java.util.List;

public interface CoAuthTargetService {
    List<CoAuthTargetVO> getAllCoAuthTargets();
    CoAuthTargetVO getCoAuthTargetById(String authCd, String userCd);
    void addCoAuthTarget(CoAuthTargetVO authTarget);
    void editCoAuthTarget(CoAuthTargetVO authTarget);
    void removeCoAuthTarget(String authCd, String userCd);
}
