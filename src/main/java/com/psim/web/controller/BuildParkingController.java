package com.psim.web.controller;

import com.psim.web.service.ParkingService;
import com.psim.web.vo.ParkingLotVO;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class BuildParkingController {
    private final ParkingService parkingService;

    public BuildParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @GetMapping("/parking/build")
    public String page() {
        return "buildparking";
    }

    @PostMapping("/parking/build")
    public String create(@RequestParam String name,
                         @RequestParam(required=false) String address,
                         @RequestParam int capacity,
                         Model model) {
        ParkingLotVO lot = new ParkingLotVO();
        lot.setName(name);
        lot.setAddress(address);
        lot.setCapacity(capacity);
        parkingService.createLot(lot);
        model.addAttribute("ok", true);
        return "buildparking";
    }
}
