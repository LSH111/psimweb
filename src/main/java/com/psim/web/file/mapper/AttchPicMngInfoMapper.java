package com.psim.web.file.mapper;

import com.psim.web.file.vo.AttchPicMngInfoVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AttchPicMngInfoMapper {
    List<AttchPicMngInfoVO> selectAllAttchPicMngInfos();
    AttchPicMngInfoVO selectAttchPicMngInfoById(Integer picMngSn);
    void insertAttchPicMngInfo(AttchPicMngInfoVO info);
    void updateAttchPicMngInfo(AttchPicMngInfoVO info);
    void deleteAttchPicMngInfo(Integer picMngSn);
}
