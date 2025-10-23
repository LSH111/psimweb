package com.psim.config;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import javax.sql.DataSource;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@MapperScan(basePackages = {
        "com.psim.web.cmm.mapper",
        "com.psim.web.api.mapper",
        "com.psim.web.prk.mapper",
        "com.psim.web.file.mapper"
})
public class MyBatisConfig {
    private static final Logger logger = LoggerFactory.getLogger(MyBatisConfig.class);
    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);

        // 매퍼 XML 파일 리소스 검증
        try {
            Resource[] resources = new PathMatchingResourcePatternResolver()
                    .getResources("classpath:mappers/**/*.xml");

            if (resources.length == 0) {
                logger.error("매퍼 XML 파일을 찾을 수 없습니다: classpath:mappers/**/*.xml");
                throw new IllegalStateException("매퍼 XML 파일을 찾을 수 없습니다: classpath:mappers/**/*.xml");
            }

            logger.info("매퍼 XML 파일 {}개를 로드했습니다.", resources.length);
            sessionFactory.setMapperLocations(resources);
        } catch (IOException e) {
            logger.error("매퍼 XML 파일 로드 중 오류 발생: {}", e.getMessage(), e);
            throw new IllegalStateException("매퍼 XML 파일 로드 중 오류 발생", e);
        }

        // MyBatis 설정
        org.apache.ibatis.session.Configuration config = createMyBatisConfiguration();
        sessionFactory.setConfiguration(config);

        return sessionFactory.getObject();
    }

    private org.apache.ibatis.session.Configuration createMyBatisConfiguration() {
        org.apache.ibatis.session.Configuration config = new org.apache.ibatis.session.Configuration();
        config.setMapUnderscoreToCamelCase(true);
        config.setCallSettersOnNulls(true);
        config.setJdbcTypeForNull(org.apache.ibatis.type.JdbcType.NULL);
        // 추가 설정들
        config.setCacheEnabled(true);
        config.setLazyLoadingEnabled(false);
        config.setAggressiveLazyLoading(false);
        return config;
    }
}
