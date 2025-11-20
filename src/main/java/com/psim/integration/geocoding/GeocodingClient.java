package com.psim.integration.geocoding;

import com.psim.integration.geocoding.model.GeoAddress;
import com.psim.integration.geocoding.model.GeoCoordinate;
import com.psim.integration.geocoding.model.GeoRegion;

import java.util.Optional;

/**
 * Provider-agnostic 지오코딩 클라이언트 인터페이스.
 * 외부 위치 API를 숨기고 도메인 친화적인 모델로 변환한다.
 */
public interface GeocodingClient {

    /**
     * 좌표를 주소 정보로 변환한다.
     */
    Optional<GeoAddress> reverseGeocode(String longitude, String latitude);

    /**
     * 주소를 좌표로 변환한다.
     */
    Optional<GeoCoordinate> geocodeAddress(String address);

    /**
     * 좌표로 행정구역 정보를 조회한다.
     */
    Optional<GeoRegion> findRegion(String longitude, String latitude);
}
