package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoZipMapper;
import com.psim.web.cmm.service.CoZipService;
import com.psim.web.cmm.vo.CoZipVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CoZipServiceImpl implements CoZipService {

    @Autowired
    private CoZipMapper coZipMapper;

    @Override
    public List<CoZipVO> getAllCoZips() {
        return coZipMapper.selectAllCoZips();
    }

    @Override
    public CoZipVO getCoZipById(String zip, Integer zipSeq) {
        return coZipMapper.selectCoZipById(zip, zipSeq);
    }

    @Override
    public void addCoZip(CoZipVO zip) {
        coZipMapper.insertCoZip(zip);
    }

    @Override
    public void editCoZip(CoZipVO zip) {
        coZipMapper.updateCoZip(zip);
    }

    @Override
    public void removeCoZip(String zip, Integer zipSeq) {
        coZipMapper.deleteCoZip(zip, zipSeq);
    }
}
