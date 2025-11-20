package com.psim.integration.geocoding.model;

import lombok.Builder;
import lombok.Value;

/**
 * 도메인에서 사용하는 행정구역 표현.
 */
@Value
@Builder
public class GeoRegion {
    String sido;
    String sigungu;
    String emd;
    String ri;
    String code;
    String regionType;
}
