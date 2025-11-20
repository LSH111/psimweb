package com.psim.integration.geocoding.model;

import lombok.Builder;
import lombok.Value;

/**
 * 도메인에서 사용하는 좌표 표현.
 */
@Value
@Builder
public class GeoCoordinate {
    String longitude; // x
    String latitude;  // y
}
