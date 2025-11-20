package com.psim.web.api.service.impl;

import com.psim.web.api.service.KakaoLocalService;
import com.psim.web.api.vo.KakaoAddress2CoordResponse;
import com.psim.web.api.vo.KakaoCoord2AddressResponse;
import com.psim.web.api.vo.KakaoCoord2RegionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
public class KakaoLocalServiceImpl implements KakaoLocalService {

    @Value("${kakao.api.key:}")
    private String kakaoApiKey;

    private static final String COORD_TO_ADDRESS_URL = "https://dapi.kakao.com/v2/local/geo/coord2address.json";
    private static final String ADDRESS_TO_COORD_URL = "https://dapi.kakao.com/v2/local/search/address.json";
    private static final String COORD_TO_REGION_URL = "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json";

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public KakaoCoord2AddressResponse convertCoord2Address(String longitude, String latitude) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(COORD_TO_ADDRESS_URL)
                    .queryParam("x", longitude)
                    .queryParam("y", latitude)
                    .queryParam("input_coord", "WGS84")
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<KakaoCoord2AddressResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    KakaoCoord2AddressResponse.class
            );

            log.info("좌표->주소 변환 성공: ({}, {}) -> {}", longitude, latitude, response.getBody());
            return response.getBody();

        } catch (Exception e) {
            log.error("좌표->주소 변환 실패: ({}, {})", longitude, latitude, e);
            throw new RuntimeException("좌표를 주소로 변환하는데 실패했습니다.", e);
        }
    }

    @Override
    public KakaoAddress2CoordResponse convertAddress2Coord(String address) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(ADDRESS_TO_COORD_URL)
                    .queryParam("query", address)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<KakaoAddress2CoordResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    KakaoAddress2CoordResponse.class
            );

            log.info("주소->좌표 변환 성공: {} -> {}", address, response.getBody());
            return response.getBody();

        } catch (Exception e) {
            log.error("주소->좌표 변환 실패: {}", address, e);
            throw new RuntimeException("주소를 좌표로 변환하는데 실패했습니다.", e);
        }
    }

    @Override
    public KakaoCoord2RegionResponse convertCoord2Region(String longitude, String latitude) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(COORD_TO_REGION_URL)
                    .queryParam("x", longitude)
                    .queryParam("y", latitude)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<KakaoCoord2RegionResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    KakaoCoord2RegionResponse.class
            );

            log.info("좌표->행정구역 변환 성공: ({}, {}) -> {}", longitude, latitude, response.getBody());
            return response.getBody();

        } catch (Exception e) {
            log.error("좌표->행정구역 변환 실패: ({}, {})", longitude, latitude, e);
            throw new RuntimeException("좌표를 행정구역으로 변환하는데 실패했습니다.", e);
        }
    }
}
