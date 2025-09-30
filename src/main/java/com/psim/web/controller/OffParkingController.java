package com.psim.web.controller;

import com.psim.web.service.ParkingService;
import com.psim.web.vo.ParkingEventVO;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class OffParkingController {
    private final ParkingService parkingService;

    public OffParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @GetMapping("/parking/off")
    public String page() {
        return "offparking";
    }

    @PostMapping("/parking/off")
    public String off(@RequestParam String carNo, Model model) {
        ParkingEventVO ev = parkingService.checkOut(carNo);
        model.addAttribute("event", ev);
        return "offparking";
    }
}
