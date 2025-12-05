package com.psim.web.cmm.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AltMapController {

    @GetMapping("/gis/parkingmap_alt")
    public String altMap() {
        return "gis/parkingmap_alt";
    }
}
