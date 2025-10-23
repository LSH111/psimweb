package com.psim.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Configuration
@EnableTransactionManagement
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        logger.info("PostgreSQL 데이터소스 초기화 시작");

        // PostgreSQL 드라이버 명시적 로드
        try {
            Class.forName(driverClassName);
            logger.info("PostgreSQL 드라이버 로드 성공: {}", driverClassName);
        } catch (ClassNotFoundException e) {
            logger.error("PostgreSQL 드라이버 로드 실패: {}", driverClassName, e);
            throw new RuntimeException("PostgreSQL 드라이버를 찾을 수 없습니다: " + driverClassName, e);
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName(driverClassName);

        // 연결 풀 최적화 설정
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(5);
        config.setConnectionTimeout(30000); // 30초
        config.setIdleTimeout(600000); // 10분
        config.setMaxLifetime(1800000); // 30분
        config.setLeakDetectionThreshold(60000); // 1분

        // 연결 검증 설정
        config.setConnectionTestQuery("SELECT 1");
        config.setValidationTimeout(3000);

        // 풀 이름 설정
        config.setPoolName("PSIMHikariPool");

        // PostgreSQL 특정 최적화
        config.addDataSourceProperty("stringtype", "unspecified");
        config.addDataSourceProperty("ApplicationName", "psim-web");

        // 필수 설정 검증
        validateDatabaseConfig(config);

        HikariDataSource dataSource = new HikariDataSource(config);

        // 연결 테스트
        testDatabaseConnection(dataSource);

        logger.info("PostgreSQL 데이터베이스 연결 풀이 성공적으로 설정되었습니다. Pool: {}, Max: {}, Min: {}",
                config.getPoolName(), config.getMaximumPoolSize(), config.getMinimumIdle());

        return dataSource;
    }

    @Bean
    @Primary
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        DataSourceTransactionManager transactionManager = new DataSourceTransactionManager(dataSource);
        transactionManager.setRollbackOnCommitFailure(true);
        logger.info("PostgreSQL 데이터베이스 트랜잭션 관리자가 설정되었습니다.");
        return transactionManager;
    }

    private void validateDatabaseConfig(HikariConfig config) {
        if (config.getJdbcUrl() == null || config.getJdbcUrl().trim().isEmpty()) {
            throw new IllegalStateException("Database JDBC URL이 설정되지 않았습니다. application.yml에서 spring.datasource.url을 확인하세요.");
        }

        if (config.getUsername() == null || config.getUsername().trim().isEmpty()) {
            throw new IllegalStateException("Database 사용자명이 설정되지 않았습니다. application.yml에서 spring.datasource.username을 확인하세요.");
        }

        if (config.getDriverClassName() == null || config.getDriverClassName().trim().isEmpty()) {
            throw new IllegalStateException("Database 드라이버가 설정되지 않았습니다. application.yml에서 spring.datasource.driver-class-name을 확인하세요.");
        }

        logger.info("PostgreSQL 데이터베이스 설정 검증 완료: URL={}, Driver={}, User={}",
                maskUrl(config.getJdbcUrl()), config.getDriverClassName(), config.getUsername());
    }

    private void testDatabaseConnection(DataSource dataSource) {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(5)) {
                logger.info("PostgreSQL 데이터베이스 연결 테스트 성공: {}", connection.getMetaData().getURL());
            } else {
                throw new SQLException("PostgreSQL 데이터베이스 연결이 유효하지 않습니다.");
            }
        } catch (SQLException e) {
            logger.error("PostgreSQL 데이터베이스 연결 테스트 실패: {}", e.getMessage(), e);
            throw new RuntimeException("PostgreSQL 데이터베이스 연결 실패. 연결 정보를 확인하세요.", e);
        }
    }

    private String maskUrl(String url) {
        if (url == null) return "null";
        // 민감한 정보 마스킹 (비밀번호 등)
        return url.replaceAll("password=[^;&]*", "password=****");
    }
}