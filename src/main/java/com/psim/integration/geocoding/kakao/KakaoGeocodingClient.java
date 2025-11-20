package com.psim.integration.geocoding.kakao;

import com.psim.integration.geocoding.GeocodingClient;
import com.psim.integration.geocoding.GeocodingException;
import com.psim.integration.geocoding.model.GeoAddress;
import com.psim.integration.geocoding.model.GeoCoordinate;
import com.psim.integration.geocoding.model.GeoRegion;
import com.psim.web.api.vo.KakaoAddress2CoordResponse;
import com.psim.web.api.vo.KakaoCoord2AddressResponse;
import com.psim.web.api.vo.KakaoCoord2RegionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Optional;
import java.util.function.Supplier;

@Slf4j
@Component
public class KakaoGeocodingClient implements GeocodingClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private final KakaoGeocodingProperties properties;

    private static final String COORD_TO_ADDRESS_URL = "/v2/local/geo/coord2address.json";
    private static final String ADDRESS_TO_COORD_URL = "/v2/local/search/address.json";
    private static final String COORD_TO_REGION_URL = "/v2/local/geo/coord2regioncode.json";

    public KakaoGeocodingClient(KakaoGeocodingProperties properties) {
        this.properties = properties;
    }

    @Override
    public Optional<GeoAddress> reverseGeocode(String longitude, String latitude) {
        KakaoCoord2AddressResponse response = execute(
                () -> UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl() + COORD_TO_ADDRESS_URL)
                        .queryParam("x", longitude)
                        .queryParam("y", latitude)
                        .queryParam("input_coord", "WGS84")
                        .toUriString(),
                KakaoCoord2AddressResponse.class
        );

        if (response == null || response.getDocuments() == null || response.getDocuments().isEmpty()) {
            return Optional.empty();
        }

        KakaoCoord2AddressResponse.Document doc = response.getDocuments().get(0);
        GeoAddress address = GeoAddress.builder()
                .jibunAddress(doc.getAddress() != null ? doc.getAddress().getAddress_name() : null)
                .roadAddress(doc.getRoad_address() != null ? doc.getRoad_address().getAddress_name() : null)
                .zoneNo(doc.getRoad_address() != null ? doc.getRoad_address().getZone_no() : null)
                .build();
        return Optional.of(address);
    }

    @Override
    public Optional<GeoCoordinate> geocodeAddress(String address) {
        KakaoAddress2CoordResponse response = execute(
                () -> UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl() + ADDRESS_TO_COORD_URL)
                        .queryParam("query", address)
                        .toUriString(),
                KakaoAddress2CoordResponse.class
        );

        if (response == null || response.getDocuments() == null || response.getDocuments().isEmpty()) {
            return Optional.empty();
        }

        KakaoAddress2CoordResponse.Document doc = response.getDocuments().get(0);
        return Optional.of(GeoCoordinate.builder()
                .longitude(doc.getX())
                .latitude(doc.getY())
                .build());
    }

    @Override
    public Optional<GeoRegion> findRegion(String longitude, String latitude) {
        KakaoCoord2RegionResponse response = execute(
                () -> UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl() + COORD_TO_REGION_URL)
                        .queryParam("x", longitude)
                        .queryParam("y", latitude)
                        .toUriString(),
                KakaoCoord2RegionResponse.class
        );

        if (response == null || response.getDocuments() == null || response.getDocuments().isEmpty()) {
            return Optional.empty();
        }

        KakaoCoord2RegionResponse.Document doc = response.getDocuments().stream()
                .filter(d -> "B".equals(d.getRegion_type()))
                .findFirst()
                .orElse(response.getDocuments().get(0));

        GeoRegion region = GeoRegion.builder()
                .sido(doc.getRegion_1depth_name())
                .sigungu(doc.getRegion_2depth_name())
                .emd(doc.getRegion_3depth_name())
                .ri(doc.getRegion_4depth_name())
                .code(doc.getCode())
                .regionType(doc.getRegion_type())
                .build();

        return Optional.of(region);
    }

    private <T> T execute(Supplier<String> urlSupplier, Class<T> clazz) {
        if (properties.getKey() == null || properties.getKey().trim().isEmpty()) {
            throw new GeocodingException("kakao.api.key 가 설정되지 않았습니다.");
        }

        String url = urlSupplier.get();
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, "KakaoAK " + properties.getKey());
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<T> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    clazz
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("카카오 지오코딩 호출 실패 - url: {}", url, e);
            throw new GeocodingException("카카오 지오코딩 호출 실패", e);
        }
    }
}
