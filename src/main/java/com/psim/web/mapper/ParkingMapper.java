package com.psim.web.mapper;

import com.psim.web.vo.ParkingEventVO;
import com.psim.web.vo.ParkingLotVO;
import java.util.List;

public interface ParkingMapper {
    List<ParkingLotVO> selectAllLots();
    void insertLot(ParkingLotVO lot);
    void insertEvent(ParkingEventVO ev);
}
