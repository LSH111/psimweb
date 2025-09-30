package com.psim.web;

import com.psim.mapper.ParkingLotMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ParkingController {
    private final ParkingLotMapper mapper;
    public ParkingController(ParkingLotMapper mapper) { this.mapper = mapper; }

    @GetMapping("/api/parking/recent")
    public Object recent() { return mapper.findRecent(); }
}