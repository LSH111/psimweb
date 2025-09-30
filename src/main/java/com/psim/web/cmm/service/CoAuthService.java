
package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoAuthVO;
import java.util.List;

public interface CoAuthService {
    List<CoAuthVO> getAllCoAuths();
    CoAuthVO getCoAuthById(String authCd);
    void addCoAuth(CoAuthVO auth);
    void editCoAuth(CoAuthVO auth);
    void removeCoAuth(String authCd);
}
