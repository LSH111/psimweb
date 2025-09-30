package com.psim.mapper;

import com.psim.domain.ParkingLot;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface ParkingLotMapper {
    @Select("SELECT id, name, type, addr FROM parking_lot ORDER BY id DESC LIMIT 100")
    List<ParkingLot> findRecent();
}