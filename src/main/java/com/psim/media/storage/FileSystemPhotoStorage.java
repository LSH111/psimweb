package com.psim.media.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileSystemPhotoStorage implements PhotoStorage {

    private static final String FALLBACK_BASE_PATH = "/Users/isihyeong/storage/data/upload";
    @Value("${file.upload.path:/Users/isihyeong/storage/data/upload}")
    private String uploadBasePath;

    // 스프링 주입 이후 경로 로깅(포스트컨스트럭트 대체)
    @org.springframework.beans.factory.annotation.Value("${file.upload.path:/Users/isihyeong/storage/data/upload}")
    private void setUploadBasePath(String basePath) {
        this.uploadBasePath = basePath;
        log.info("📂 파일 업로드 기본 경로: {}", uploadBasePath);
    }

    @Override
    public SaveResult save(String category, MultipartFile file) {
        validate(file);

        try {
            String dateDir = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String relativePath = category + "/" + dateDir;
            Path dirPath = Paths.get(uploadBasePath, category, dateDir);

            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
                log.info("📁 디렉토리 생성: {}", dirPath);
            }

            String extension = extractExtension(file.getOriginalFilename());
            String savedFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

            Path target = dirPath.resolve(savedFileName);
            file.transferTo(target);
            log.info("💾 파일 저장: {} -> {}", file.getOriginalFilename(), target);

            return new SaveResult(relativePath, savedFileName, extension);
        } catch (IOException e) {
            throw new IllegalStateException("파일을 저장하는 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    public void delete(String relativePath, String fileName) {
        if (relativePath == null || fileName == null) {
            return;
        }
        Path path = Paths.get(uploadBasePath, relativePath, fileName);
        try {
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("🗑️ 파일 삭제: {}", path);
            }
        } catch (IOException e) {
            log.warn("⚠️ 파일 삭제 실패: {}", path, e);
        }
    }

    @Override
    public Resource loadAsResource(String relativePath, String fileName) {
        try {
            if (relativePath == null || fileName == null) {
                log.warn("⚠️ loadAsResource 호출 시 경로/파일명이 없습니다. relativePath={}, fileName={}", relativePath, fileName);
                return null;
            }
            // 1차: 설정된 기본 경로
            Path path = Paths.get(uploadBasePath, relativePath, fileName);
            Resource resource = new UrlResource(path.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            // 2차: 로컬 개발용 폴백 경로
            if (!uploadBasePath.equals(FALLBACK_BASE_PATH)) {
                Path fallback = Paths.get(FALLBACK_BASE_PATH, relativePath, fileName);
                Resource fallbackRes = new UrlResource(fallback.toUri());
                if (fallbackRes.exists() && fallbackRes.isReadable()) {
                    log.warn("⚠️ 기본 경로에 파일이 없어서 폴백 경로에서 제공: {}", fallback);
                    return fallbackRes;
                }
            }

            log.warn("⚠️ 파일을 찾을 수 없거나 읽을 수 없습니다: {}", path);
            return null;
        } catch (Exception e) {
            log.warn("⚠️ 파일 로드 실패: {}/{}", relativePath, fileName, e);
            return null;
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
    }

    private String extractExtension(String fileName) {
        if (Objects.isNull(fileName) || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
}
