package com.psim.integration.geocoding.kakao;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "kakao.api")
public class KakaoGeocodingProperties {
    /**
     * Kakao REST API 키 (필수).
     */
    private String key = "9e769fbf1ccdb874ffffc371a19e12d8";

    /**
     * Kakao 로컬 API 베이스 URL.
     */
    private String baseUrl = "https://dapi.kakao.com";
}
