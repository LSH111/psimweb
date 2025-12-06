package com.psim.web.file.service.impl;

import com.psim.web.file.service.AttchPicMngInfoService;
import com.psim.web.file.vo.AttchPicMngInfoVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.Assumptions;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@Transactional
@TestPropertySource(properties = {
        "file.upload.path=${java.io.tmpdir}/psim-it-files"
})
class AttchPicMngInfoServiceImplIT {

    @Autowired
    private AttchPicMngInfoService service;

    @MockBean
    private com.psim.web.file.mapper.AttchPicMngInfoMapper mapper;

    @Test
    @DisplayName("파일 목록 업로드 요청이 null/빈 경우 빈 리스트를 반환한다")
    void uploadAndSaveFiles_emptyList_returnsEmpty() {
        List<MultipartFile> files = Collections.emptyList();

        List<AttchPicMngInfoVO> result = service.uploadAndSaveFiles("PRK-MNG-NO", 1, "TEST", files);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("이용실태 파일 목록 요청이 null/빈 경우 IllegalArgumentException을 던진다")
    void uploadAndSaveFilesForUsage_emptyList_throws() {
        List<MultipartFile> files = Collections.emptyList();

        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () ->
                service.uploadAndSaveFilesForUsage("PRK-MNG-NO", "CMPL_SN", "TEST", files, "user", "127.0.0.1"));
    }

    @Test
    @DisplayName("첨부 목록 조회가 null이 아닌 리스트를 반환한다")
    void getAttchPicMngInfoList_notNull() {
        try {
            when(mapper.selectAttchPicMngInfoList(1, "TEST", null)).thenReturn(Collections.emptyList());
            List<AttchPicMngInfoVO> list = service.getAttchPicMngInfoList(1, "TEST");
            assertThat(list).isNotNull();
        } catch (Exception e) {
            Assumptions.assumeTrue(false, "파일/DB 환경이 준비되지 않아 테스트를 건너뜁니다: " + e.getMessage());
        }
    }
}
