package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoZipVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CoZipMapper {
    List<CoZipVO> selectAllCoZips();
    CoZipVO selectCoZipById(String zip, Integer zipSeq);
    void insertCoZip(CoZipVO zip);
    void updateCoZip(CoZipVO zip);
    void deleteCoZip(String zip, Integer zipSeq);
}
