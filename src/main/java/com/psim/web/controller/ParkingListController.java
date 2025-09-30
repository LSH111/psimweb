package com.psim.web.controller;

import com.psim.web.service.ParkingService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ParkingListController {
    private final ParkingService parkingService;

    public ParkingListController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @GetMapping("/parking/list")
    public String list(Model model) {
        model.addAttribute("lots", parkingService.findAllLots());
        return "parking-list";
    }
}
