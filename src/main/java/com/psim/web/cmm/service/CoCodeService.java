package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoCodeVO;
import java.util.List;

public interface CoCodeService {
    List<CoCodeVO> getAllCodes();
    CoCodeVO getCodeById(String groupCd, String commonCd);
    void addCode(CoCodeVO code);
    void editCode(CoCodeVO code);
    void removeCode(String groupCd, String commonCd);
}
