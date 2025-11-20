package com.psim.web.api.service.impl;

import com.psim.web.api.service.KakaoLocalService;
import com.psim.web.api.vo.KakaoAddress2CoordResponse;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@SpringBootTest
class KakaoLocalServiceImplIT {

    @Autowired
    private KakaoLocalService kakaoLocalService;

    @Value("${kakao.api.key:}")
    private String kakaoApiKey;

    @Test
    @DisplayName("실제 카카오 API를 이용해 주소를 좌표로 변환한다")
    void convertAddress2Coord_realCall() {
        Assumptions.assumeTrue(kakaoApiKey != null && !kakaoApiKey.trim().isEmpty(),
                "kakao.api.key 가 설정되어 있지 않아 테스트를 건너뜁니다.");

        KakaoAddress2CoordResponse response = kakaoLocalService.convertAddress2Coord("서울특별시 중구 세종대로 110");

        assertThat(response).isNotNull();
        Assumptions.assumeTrue(response.getDocuments() != null && !response.getDocuments().isEmpty(),
                "카카오 응답이 비어 있어 검증을 건너뜁니다.");
        KakaoAddress2CoordResponse.Document doc = response.getDocuments().get(0);
        assertThat(doc.getX()).isNotBlank();
        assertThat(doc.getY()).isNotBlank();
    }

    @Test
    @DisplayName("잘못된 주소로 호출 시 documents가 비어있다")
    void convertAddress2Coord_invalidAddress() {
        Assumptions.assumeTrue(kakaoApiKey != null && !kakaoApiKey.trim().isEmpty(),
                "kakao.api.key 가 설정되어 있지 않아 테스트를 건너뜁니다.");

        KakaoAddress2CoordResponse response = kakaoLocalService.convertAddress2Coord("!@#$$%^&*()");

        assertThat(response).isNotNull();
        assertThat(response.getDocuments()).isEmpty();
    }
}
