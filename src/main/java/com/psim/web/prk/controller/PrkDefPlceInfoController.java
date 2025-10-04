package com.psim.web.prk.controller;

import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.PrkDefPlceInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
