package com.psim;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

// 이전에 추가했던 exclude 속성을 다시 제거합니다.
@SpringBootApplication
public class PsimWebApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(PsimWebApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(PsimWebApplication.class);
    }
}