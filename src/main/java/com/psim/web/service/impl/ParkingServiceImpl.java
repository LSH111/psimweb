package com.psim.web.service.impl;

import com.psim.web.mapper.ParkingMapper;
import com.psim.web.service.ParkingService;
import com.psim.web.vo.ParkingEventVO;
import com.psim.web.vo.ParkingLotVO;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class ParkingServiceImpl implements ParkingService {

    private final ParkingMapper parkingMapper;

    public ParkingServiceImpl(ParkingMapper parkingMapper) {
        this.parkingMapper = parkingMapper;
    }

    @Override
    public List<ParkingLotVO> findAllLots() {
        return parkingMapper.selectAllLots();
    }

    @Override
    public void createLot(ParkingLotVO lot) {
        parkingMapper.insertLot(lot);
    }

    @Override
    public ParkingEventVO checkIn(String carNo, Long lotId) {
        ParkingEventVO ev = new ParkingEventVO();
        ev.setCarNo(carNo);
        ev.setLotId(lotId);
        ev.setType("IN");
        ev.setAt(OffsetDateTime.now().toString());
        parkingMapper.insertEvent(ev);
        return ev;
    }

    @Override
    public ParkingEventVO checkOut(String carNo) {
        ParkingEventVO ev = new ParkingEventVO();
        ev.setCarNo(carNo);
        ev.setType("OUT");
        ev.setAt(OffsetDateTime.now().toString());
        parkingMapper.insertEvent(ev);
        return ev;
    }
}
