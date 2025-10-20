package com.psim.web.file.service;

import com.psim.web.file.vo.AttchPicMngInfoVO;

import java.util.List;

public interface AttchPicMngInfoService {
    List<AttchPicMngInfoVO> getAllAttchPicMngInfos();
    AttchPicMngInfoVO getAttchPicMngInfoById(Integer picMngSn);
    void addAttchPicMngInfo(AttchPicMngInfoVO info);
    void editAttchPicMngInfo(AttchPicMngInfoVO info);
    void removeAttchPicMngInfo(Integer picMngSn);
}
