package com.psim.web.service;

import com.psim.web.vo.ParkingEventVO;
import com.psim.web.vo.ParkingLotVO;
import java.util.List;

public interface ParkingService {
    List<ParkingLotVO> findAllLots();
    void createLot(ParkingLotVO lot);
    ParkingEventVO checkIn(String carNo, Long lotId);
    ParkingEventVO checkOut(String carNo);
}
