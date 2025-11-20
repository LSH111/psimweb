package com.psim.integration.geocoding.model;

import lombok.Builder;
import lombok.Value;

/**
 * 도메인에서 사용하는 주소 표현.
 */
@Value
@Builder
public class GeoAddress {
    String jibunAddress;
    String roadAddress;
    String zoneNo;
}
