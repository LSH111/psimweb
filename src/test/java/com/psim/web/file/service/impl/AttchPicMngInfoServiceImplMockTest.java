package com.psim.web.file.service.impl;

import com.psim.media.storage.PhotoStorage;
import com.psim.web.file.mapper.AttchPicMngInfoMapper;
import com.psim.web.file.vo.AttchPicMngInfoVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttchPicMngInfoServiceImplMockTest {

    @Mock
    private AttchPicMngInfoMapper mapper;

    @Mock
    private PhotoStorage photoStorage;

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private AttchPicMngInfoServiceImpl service;

    @Test
    @DisplayName("단일 파일 업로드 성공 시 VO가 반환되고 mapper가 호출된다")
    void uploadAndSaveFile_success() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getOriginalFilename()).thenReturn("test.png");
        when(photoStorage.save(anyString(), eq(multipartFile)))
                .thenReturn(new PhotoStorage.SaveResult("PRK/20250101", "uuid.png", "png"));
        when(mapper.selectMaxSeqNo(anyInt(), anyString())).thenReturn(1);

        AttchPicMngInfoVO vo = service.uploadAndSaveFile(1, "MAIN", multipartFile);

        assertThat(vo.getFileNm()).isEqualTo("uuid.png");
        assertThat(vo.getFilePath()).isEqualTo("PRK/20250101");
        verify(mapper).insertAttchPicMngInfo(any(AttchPicMngInfoVO.class));
    }

    @Test
    @DisplayName("빈 파일 업로드 시 IllegalArgumentException 발생")
    void uploadAndSaveFile_empty_throws() {
        when(multipartFile.isEmpty()).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () ->
                service.uploadAndSaveFile(1, "MAIN", multipartFile));
    }

    @Test
    @DisplayName("첨부 목록 조회는 mapper 결과를 그대로 반환한다")
    void getAttchPicMngInfoList_returnsMapperValue() {
        List<AttchPicMngInfoVO> expected = Collections.singletonList(new AttchPicMngInfoVO());
        when(mapper.selectAttchPicMngInfoList(1, "MAIN", null)).thenReturn(expected);

        List<AttchPicMngInfoVO> result = service.getAttchPicMngInfoList(1, "MAIN");

        assertThat(result).isSameAs(expected);
    }

    @Test
    @DisplayName("사진 파일 데이터 조회 시 Content-Type을 결정해 반환한다")
    void getPhotoFile_setsContentType() {
        Map<String, Object> photoInfo = new java.util.HashMap<>();
        photoInfo.put("extNm", "png");
        photoInfo.put("fileName", "a.png");
        when(mapper.selectPhotoFile(1, "MAIN", 1)).thenReturn(photoInfo);

        Map<String, Object> result = service.getPhotoFile(1, "MAIN", 1);

        assertThat(result.get("contentType")).isEqualTo("image/png");
    }

    @Test
    @DisplayName("이용실태 파일 다중 업로드 시 mapper insert가 반복 호출된다")
    void uploadAndSaveFilesForUsage_insertLoop() {
        MultipartFile file1 = mock(MultipartFile.class);
        MultipartFile file2 = mock(MultipartFile.class);
        when(file1.isEmpty()).thenReturn(false);
        when(file2.isEmpty()).thenReturn(false);
        when(file1.getOriginalFilename()).thenReturn("a.png");
        when(file2.getOriginalFilename()).thenReturn("b.jpg");
        when(photoStorage.save(anyString(), any(MultipartFile.class)))
                .thenReturn(new PhotoStorage.SaveResult("USG/20250101", "a.png", "png"))
                .thenReturn(new PhotoStorage.SaveResult("USG/20250101", "b.jpg", "jpg"));
        when(mapper.selectMaxSeqNoForUsage(anyString(), anyString())).thenReturn(0);

        List<AttchPicMngInfoVO> result = service.uploadAndSaveFilesForUsage("CMPL", "USG", Arrays.asList(file1, file2), "user", "127.0.0.1");

        assertThat(result).hasSize(2);
        verify(mapper, times(2)).insertAttchPicMngInfo(any(AttchPicMngInfoVO.class));
    }
}
