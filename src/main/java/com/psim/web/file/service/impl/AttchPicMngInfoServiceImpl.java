package com.psim.web.file.service.impl;

import com.psim.web.file.mapper.AttchPicMngInfoMapper;
import com.psim.web.file.service.AttchPicMngInfoService;
import com.psim.web.file.vo.AttchPicMngInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttchPicMngInfoServiceImpl implements AttchPicMngInfoService {

    @Autowired
    private AttchPicMngInfoMapper attchPicMngInfoMapper;

    @Override
    public List<AttchPicMngInfoVO> getAllAttchPicMngInfos() {
        return attchPicMngInfoMapper.selectAllAttchPicMngInfos();
    }

    @Override
    public AttchPicMngInfoVO getAttchPicMngInfoById(Integer picMngSn) {
        return attchPicMngInfoMapper.selectAttchPicMngInfoById(picMngSn);
    }

    @Override
    public void addAttchPicMngInfo(AttchPicMngInfoVO info) {
        attchPicMngInfoMapper.insertAttchPicMngInfo(info);
    }

    @Override
    public void editAttchPicMngInfo(AttchPicMngInfoVO info) {
        attchPicMngInfoMapper.updateAttchPicMngInfo(info);
    }

    @Override
    public void removeAttchPicMngInfo(Integer picMngSn) {
        attchPicMngInfoMapper.deleteAttchPicMngInfo(picMngSn);
    }
}
