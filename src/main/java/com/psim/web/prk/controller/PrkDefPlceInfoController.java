package com.psim.web.prk.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/prk")
public class PrkDefPlceInfoController {

    @GetMapping("/parkinglist")
    public String parkingList() {
        return "prk/parking-list";
    }

    // 노상 상세
    @GetMapping("/onparking")
    public String onParking() {
        return "prk/onparking"; // /WEB-INF/views/prk/onparking.jsp
    }
    // 노외 상세
    @GetMapping("/offparking")
    public String offParking() {
        return "prk/offparking";
    }
    // 부설 상세
    @GetMapping("/buildparking")
    public String buildParking() {
        return "prk/buildparking";
    }
}
