package com.psim.web.api.service.impl;

import com.psim.web.api.service.KakaoLocalService;
import com.psim.web.api.vo.KakaoAddress2CoordResponse;
import com.psim.web.api.vo.KakaoCoord2AddressResponse;
import com.psim.web.api.vo.KakaoCoord2RegionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.Optional;

@Slf4j
@Service
public class KakaoLocalServiceImpl implements KakaoLocalService {

    @Value("${kakao.api.key:}")
    private String kakaoApiKey;

    private static final String COORD_TO_ADDRESS_URL = "https://dapi.kakao.com/v2/local/geo/coord2address.json";
    private static final String ADDRESS_TO_COORD_URL = "https://dapi.kakao.com/v2/local/search/address.json";
    private static final String COORD_TO_REGION_URL = "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json";

    private final RestTemplate restTemplate;

    public KakaoLocalServiceImpl(RestTemplate kakaoRestTemplate) {
        this.restTemplate = kakaoRestTemplate;
    }

    @Override
    public KakaoCoord2AddressResponse convertCoord2Address(String longitude, String latitude) {
        try {
            ensureApiKeyPresent();
            String url = UriComponentsBuilder.fromHttpUrl(COORD_TO_ADDRESS_URL)
                    .queryParam("x", longitude)
                    .queryParam("y", latitude)
                    .queryParam("input_coord", "WGS84")
                    .toUriString();

            KakaoCoord2AddressResponse response = invoke(url, KakaoCoord2AddressResponse.class);
            log.info("좌표->주소 변환 성공: ({}, {}) -> {}", longitude, latitude, response);
            return response;

        } catch (RestClientException e) {
            log.error("좌표->주소 변환 실패: ({}, {})", longitude, latitude, e);
            throw new KakaoApiException("좌표를 주소로 변환하는데 실패했습니다.", e);
        }
    }

    @Override
    public KakaoAddress2CoordResponse convertAddress2Coord(String address) {
        try {
            ensureApiKeyPresent();
            String url = UriComponentsBuilder.fromHttpUrl(ADDRESS_TO_COORD_URL)
                    .queryParam("query", address)
                    .toUriString();

            KakaoAddress2CoordResponse response = invoke(url, KakaoAddress2CoordResponse.class);
            log.info("주소->좌표 변환 성공: {} -> {}", address, response);
            return response;

        } catch (RestClientException e) {
            log.error("주소->좌표 변환 실패: {}", address, e);
            throw new KakaoApiException("주소를 좌표로 변환하는데 실패했습니다.", e);
        }
    }

    @Override
    public KakaoCoord2RegionResponse convertCoord2Region(String longitude, String latitude) {
        try {
            ensureApiKeyPresent();
            String url = UriComponentsBuilder.fromHttpUrl(COORD_TO_REGION_URL)
                    .queryParam("x", longitude)
                    .queryParam("y", latitude)
                    .toUriString();

            KakaoCoord2RegionResponse response = invoke(url, KakaoCoord2RegionResponse.class);
            log.info("좌표->행정구역 변환 성공: ({}, {}) -> {}", longitude, latitude, response);
            return response;

        } catch (RestClientException e) {
            log.error("좌표->행정구역 변환 실패: ({}, {})", longitude, latitude, e);
            throw new KakaoApiException("좌표를 행정구역으로 변환하는데 실패했습니다.", e);
        }
    }

    private void ensureApiKeyPresent() {
        if (kakaoApiKey == null || kakaoApiKey.trim().isEmpty()) {
            throw new IllegalStateException("kakao.api.key가 설정되지 않았습니다.");
        }
    }

    private <T> T invoke(String url, Class<T> responseType) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<T> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                responseType
        );

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new KakaoApiException("카카오 API 호출 실패. status=" + response.getStatusCode());
        }
        return Optional.ofNullable(response.getBody()).orElseThrow(() ->
                new KakaoApiException("카카오 API 응답이 비어있습니다."));
    }

    public static class KakaoApiException extends RuntimeException {
        public KakaoApiException(String message) {
            super(message);
        }

        public KakaoApiException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
