package com.psim.integration.geocoding.kakao;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(KakaoGeocodingProperties.class)
public class GeocodingConfig {
}
