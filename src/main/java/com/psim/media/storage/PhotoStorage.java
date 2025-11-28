package com.psim.media.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * 파일 시스템/S3 등 실제 파일 저장소에 대한 추상화.
 */
public interface PhotoStorage {

    SaveResult save(String category, MultipartFile file);

    void delete(String relativePath, String fileName);

    Resource loadAsResource(String relativePath, String fileName);

    /**
     * 파일 저장 결과 값 객체 (Java 8 호환).
     */
    class SaveResult {
        private final String relativePath;
        private final String savedFileName;
        private final String extension;

        public SaveResult(String relativePath, String savedFileName, String extension) {
            this.relativePath = relativePath;
            this.savedFileName = savedFileName;
            this.extension = extension;
        }

        public String relativePath() {
            return relativePath;
        }

        public String savedFileName() {
            return savedFileName;
        }

        public String extension() {
            return extension;
        }

        public String getRelativePath() {
            return relativePath;
        }

        public String getSavedFileName() {
            return savedFileName;
        }

        public String getExtension() {
            return extension;
        }
    }
}
