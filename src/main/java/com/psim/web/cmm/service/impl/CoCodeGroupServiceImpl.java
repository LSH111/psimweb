package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoCodeGroupMapper;
import com.psim.web.cmm.service.CoCodeGroupService;
import com.psim.web.cmm.vo.CoCodeGroupVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CoCodeGroupServiceImpl implements CoCodeGroupService {

    @Autowired
    private CoCodeGroupMapper coCodeGroupMapper;

    @Override
    public List<CoCodeGroupVO> getAllCoCodeGroups() {
        return coCodeGroupMapper.selectAllCoCodeGroups();
    }

    @Override
    public CoCodeGroupVO getCoCodeGroupById(String groupCd) {
        return coCodeGroupMapper.selectCoCodeGroupById(groupCd);
    }

    @Override
    public void addCoCodeGroup(CoCodeGroupVO codeGroup) {
        coCodeGroupMapper.insertCoCodeGroup(codeGroup);
    }

    @Override
    public void editCoCodeGroup(CoCodeGroupVO codeGroup) {
        coCodeGroupMapper.updateCoCodeGroup(codeGroup);
    }

    @Override
    public void removeCoCodeGroup(String groupCd) {
        coCodeGroupMapper.deleteCoCodeGroup(groupCd);
    }
}
