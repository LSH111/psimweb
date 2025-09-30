package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoAddrMapper;
import com.psim.web.cmm.service.CoAddrService;
import com.psim.web.cmm.vo.CoAddrVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@SuppressWarnings("ALL")
@Service
public class CoAddrServiceImpl implements CoAddrService {

    @Autowired
    private CoAddrMapper coAddrMapper;

    @Override
    public List<CoAddrVO> getAllCoAddrs() {
        return coAddrMapper.selectAllCoAddrs();
    }

    @Override
    public CoAddrVO getCoAddrById(String manageNo) {
        return coAddrMapper.selectCoAddrById(manageNo);
    }

    @Override
    public void addCoAddr(CoAddrVO addr) {
        coAddrMapper.insertCoAddr(addr);
    }

    @Override
    public void editCoAddr(CoAddrVO addr) {
        coAddrMapper.updateCoAddr(addr);
    }

    @Override
    public void removeCoAddr(String manageNo) {
        coAddrMapper.deleteCoAddr(manageNo);
    }
}
