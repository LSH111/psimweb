package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoAddrJibunMapper;
import com.psim.web.cmm.service.CoAddrJibunService;
import com.psim.web.cmm.vo.CoAddrJibunVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CoAddrJibunServiceImpl implements CoAddrJibunService {

    @Autowired
    private CoAddrJibunMapper coAddrJibunMapper;

    @Override
    public List<CoAddrJibunVO> getAllCoAddrJibuns() {
        return coAddrJibunMapper.selectAllCoAddrJibuns();
    }

    @Override
    public CoAddrJibunVO getCoAddrJibunById(String manageNo) {
        return coAddrJibunMapper.selectCoAddrJibunById(manageNo);
    }

    @Override
    public void addCoAddrJibun(CoAddrJibunVO addrJibun) {
        coAddrJibunMapper.insertCoAddrJibun(addrJibun);
    }

    @Override
    public void editCoAddrJibun(CoAddrJibunVO addrJibun) {
        coAddrJibunMapper.updateCoAddrJibun(addrJibun);
    }

    @Override
    public void removeCoAddrJibun(String manageNo) {
        coAddrJibunMapper.deleteCoAddrJibun(manageNo);
    }
}
