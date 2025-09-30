package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoZipVO;
import java.util.List;

public interface CoZipService {
    List<CoZipVO> getAllCoZips();
    CoZipVO getCoZipById(String zip, Integer zipSeq);
    void addCoZip(CoZipVO zip);
    void editCoZip(CoZipVO zip);
    void removeCoZip(String zip, Integer zipSeq);
}
