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

    @Value("${file.upload.path:/upload/parking}")
    private String uploadBasePath;

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
            Path path = Paths.get(uploadBasePath, relativePath, fileName);
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return null;
            }
            return resource;
        } catch (java.net.MalformedURLException e) {
            log.warn("⚠️ 파일 경로 오류: {}/{}", relativePath, fileName, e);
            return null;
        } catch (RuntimeException e) {
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
