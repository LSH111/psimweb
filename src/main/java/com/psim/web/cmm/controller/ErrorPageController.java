package com.psim.web.cmm.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/error")
public class ErrorPageController {

    @GetMapping("/400")
    public String error400() {
        return "error/error-400";
    }

    @GetMapping("/403")
    public String error403() {
        return "error/error-403";
    }

    @GetMapping("/404")
    public String error404() {
        return "error/error-404";
    }

    @GetMapping("/500")
    public String error500() {
        return "error/error-500";
    }

    @GetMapping("/default")
    public String errorDefault() {
        return "error/error";
    }
}
