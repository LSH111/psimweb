package com.psim.web.controller;

import com.psim.web.service.ParkingService;
import com.psim.web.vo.ParkingEventVO;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class OnParkingController {
    private final ParkingService parkingService;

    public OnParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @GetMapping("/parking/on")
    public String page() {
        return "onparking";
    }

    @PostMapping("/parking/on")
    public String on(@RequestParam String carNo,
                     @RequestParam Long lotId,
                     Model model) {
        ParkingEventVO ev = parkingService.checkIn(carNo, lotId);
        model.addAttribute("event", ev);
        return "onparking";
    }
}
