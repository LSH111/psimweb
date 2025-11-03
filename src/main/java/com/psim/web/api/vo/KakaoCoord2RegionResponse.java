
package com.psim.web.api.vo;

import lombok.Data;
import java.util.List;

@Data
public class KakaoCoord2RegionResponse {
    private Meta meta;
    private List<Document> documents;

    @Data
    public static class Meta {
        private Integer total_count;
    }

    @Data
    public static class Document {
        private String region_type; // H(행정동) 또는 B(법정동)
        private String address_name; // 전체 지역 명칭
        private String region_1depth_name; // 시도 명칭
        private String region_2depth_name; // 시군구 명칭
        private String region_3depth_name; // 읍면동 명칭
        private String region_4depth_name; // 리
        private String code; // region 코드
        private Double x; // X 좌표값, 경도(longitude)
        private Double y; // Y 좌표값, 위도(latitude)
    }
}
