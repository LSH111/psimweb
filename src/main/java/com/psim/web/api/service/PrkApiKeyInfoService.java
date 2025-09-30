package com.psim.web.api.service;

import com.psim.web.api.vo.PrkApiKeyInfoVO;
import java.util.List;

public interface PrkApiKeyInfoService {
    List<PrkApiKeyInfoVO> getAllPrkApiKeyInfos();
    PrkApiKeyInfoVO getPrkApiKeyInfoById(Integer apiKeySn);
    void addPrkApiKeyInfo(PrkApiKeyInfoVO info);
    void editPrkApiKeyInfo(PrkApiKeyInfoVO info);
    void removePrkApiKeyInfo(Integer apiKeySn);
}
