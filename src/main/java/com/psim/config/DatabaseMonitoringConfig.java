package com.psim.config;

import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableScheduling
public class DatabaseMonitoringConfig {

    @Component
    @Endpoint(id = "database-pool")
    public static class DatabasePoolEndpoint {
        
        @Autowired
        private DataSource dataSource;
        
        @ReadOperation
        public Map<String, Object> getDatabasePoolInfo() {
            Map<String, Object> info = new HashMap<>();
            
            if (dataSource instanceof HikariDataSource) {
                HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
                HikariPoolMXBean poolMXBean = hikariDataSource.getHikariPoolMXBean();
                
                info.put("poolName", hikariDataSource.getPoolName());
                info.put("activeConnections", poolMXBean.getActiveConnections());
                info.put("idleConnections", poolMXBean.getIdleConnections());
                info.put("totalConnections", poolMXBean.getTotalConnections());
                info.put("threadsAwaitingConnection", poolMXBean.getThreadsAwaitingConnection());
                info.put("maximumPoolSize", hikariDataSource.getMaximumPoolSize());
                info.put("minimumIdle", hikariDataSource.getMinimumIdle());
            }
            
            return info;
        }
    }
    
    @Component
    public static class DatabasePoolMonitor {
        
        private static final Logger logger = LoggerFactory.getLogger(DatabasePoolMonitor.class);
        
        @Autowired
        private DataSource dataSource;
        
        @Scheduled(fixedRate = 300000) // 5분마다 실행
        public void monitorConnectionPool() {
            if (dataSource instanceof HikariDataSource) {
                HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
                HikariPoolMXBean poolMXBean = hikariDataSource.getHikariPoolMXBean();
                
                int active = poolMXBean.getActiveConnections();
                int idle = poolMXBean.getIdleConnections();
                int total = poolMXBean.getTotalConnections();
                int waiting = poolMXBean.getThreadsAwaitingConnection();
                
                logger.info("DB Pool Status - Active: {}, Idle: {}, Total: {}, Waiting: {}", 
                           active, idle, total, waiting);
                
                // 경고 조건
                if (waiting > 0) {
                    logger.warn("데이터베이스 연결 대기 중인 스레드가 있습니다: {}", waiting);
                }
                
                if (total >= hikariDataSource.getMaximumPoolSize() * 0.8) {
                    logger.warn("데이터베이스 연결 풀 사용률이 80%를 초과했습니다: {}/{}", 
                               total, hikariDataSource.getMaximumPoolSize());
                }
            }
        }
    }
}
