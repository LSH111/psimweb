package com.psim.web.api.vo;

import lombok.Data;
import java.util.List;

@Data
public class KakaoAddress2CoordResponse {
    private Meta meta;
    private List<Document> documents;

    @Data
    public static class Meta {
        private Integer total_count;
        private Integer pageable_count;
        private Boolean is_end;
    }

    @Data
    public static class Document {
        private String address_name;
        private String address_type;
        private String x; // 경도
        private String y; // 위도
        private Address address;
        private RoadAddress road_address;

        @Data
        public static class Address {
            private String address_name;
            private String region_1depth_name;
            private String region_2depth_name;
            private String region_3depth_name;
            private String mountain_yn;
            private String main_address_no;
            private String sub_address_no;
        }

        @Data
        public static class RoadAddress {
            private String address_name;
            private String region_1depth_name;
            private String region_2depth_name;
            private String region_3depth_name;
            private String road_name;
            private String underground_yn;
            private String main_building_no;
            private String sub_building_no;
            private String building_name;
            private String zone_no;
        }
    }
}
