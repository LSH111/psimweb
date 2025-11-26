package com.psim.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class


RestClientConfig {

    @Bean
    public RestTemplate kakaoRestTemplate(
            RestTemplateBuilder builder,
            @Value("${kakao.api.connect-timeout-ms:5000}") long connectTimeout,
            @Value("${kakao.api.read-timeout-ms:5000}") long readTimeout
    ) {
        return builder
                .setConnectTimeout(Duration.ofMillis(connectTimeout))
                .setReadTimeout(Duration.ofMillis(readTimeout))
                .build();
    }
}
