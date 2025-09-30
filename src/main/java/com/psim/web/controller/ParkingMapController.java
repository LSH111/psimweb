package com.psim.web.controller;

import com.psim.web.service.ParkingService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ParkingMapController {
    private final ParkingService parkingService;

    public ParkingMapController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @GetMapping("/parking/map")
    public String map(Model model) {
        model.addAttribute("lots", parkingService.findAllLots());
        return "parkingmap";
    }
}
