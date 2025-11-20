package com.psim.web.api.service.impl;

import com.psim.web.api.vo.KakaoAddress2CoordResponse;
import com.psim.web.api.vo.KakaoCoord2AddressResponse;
import com.psim.web.api.vo.KakaoCoord2RegionResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KakaoLocalServiceImplMockTest {

    @Mock
    RestTemplate restTemplate;

    @InjectMocks
    KakaoLocalServiceImpl service; // 필드 restTemplate를 Reflection으로 교체

    private void injectRestTemplate() {
        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
    }

    @Test
    @DisplayName("좌표->주소 변환 성공 시 첫 document를 반환한다")
    void convertCoord2Address_success() {
        injectRestTemplate();
        KakaoCoord2AddressResponse response = new KakaoCoord2AddressResponse();
        KakaoCoord2AddressResponse.Document doc = new KakaoCoord2AddressResponse.Document();
        response.setDocuments(Collections.singletonList(doc));

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(KakaoCoord2AddressResponse.class)))
                .thenReturn(ResponseEntity.ok(response));

        KakaoCoord2AddressResponse result = service.convertCoord2Address("127.1", "37.1");

        assertThat(result.getDocuments()).hasSize(1);
    }

    @Test
    @DisplayName("주소->좌표 변환 시 빈 결과를 허용한다")
    void convertAddress2Coord_emptyDocuments() {
        injectRestTemplate();
        KakaoAddress2CoordResponse response = new KakaoAddress2CoordResponse();
        response.setDocuments(Collections.emptyList());

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(KakaoAddress2CoordResponse.class)))
                .thenReturn(ResponseEntity.ok(response));

        KakaoAddress2CoordResponse result = service.convertAddress2Coord("unknown address");
        assertThat(result.getDocuments()).isEmpty();
    }

    @Test
    @DisplayName("좌표->행정구역 변환 시 RestTemplate 예외를 래핑한다")
    void convertCoord2Region_exception() {
        injectRestTemplate();
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(KakaoCoord2RegionResponse.class)))
                .thenThrow(new RuntimeException("HTTP 500"));

        assertThrows(RuntimeException.class, () ->
                service.convertCoord2Region("127.1", "37.1"));
    }
}
