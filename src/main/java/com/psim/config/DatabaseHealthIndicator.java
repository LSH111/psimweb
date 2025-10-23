package com.psim.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseHealthIndicator.class);
    
    @Autowired
    private DataSource dataSource;
    
    @Override
    public Health health() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(5)) {
                // 간단한 쿼리 실행으로 DB 상태 확인
                try (PreparedStatement stmt = connection.prepareStatement("SELECT 1");
                     ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        return Health.up()
                                .withDetail("database", "MySQL")
                                .withDetail("status", "Connection successful")
                                .build();
                    }
                }
            }
        } catch (SQLException e) {
            logger.error("데이터베이스 헬스 체크 실패: {}", e.getMessage(), e);
            return Health.down()
                    .withDetail("database", "MySQL")
                    .withDetail("error", e.getMessage())
                    .build();
        }
        
        return Health.down()
                .withDetail("database", "MySQL")
                .withDetail("error", "Connection validation failed")
                .build();
    }
}
