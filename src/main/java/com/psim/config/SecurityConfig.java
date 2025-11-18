package com.psim.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // AuthInterceptor의 화이트리스트 로직을 여기에 정의합니다.
    private static final String[] WHITELIST = {
            // 정적 리소스
            "/static/**", "/resources/**", "/webjars/**", "/public/**", "/assets/**", "/css/**", "/js/**", "/img/**",
            // 로그인 및 시스템 경로
            "/", "/login", "/logout", "/error", "/health", "/favicon.ico", "/api/health",
            "/egovCrypto", "/egovCrypto/info", "/.well-known/**",
            // 허용된 API
            "/cmm/codes/**", "/api/**"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 보호를 비활성화합니다. (API 서버로 사용하거나, 별도의 CSRF 토큰 처리를 할 경우)
                // 만약 웹 애플리케이션의 보안이 중요하다면, CSRF 토큰을 클라이언트와 주고받는 방식으로 구현해야 합니다.
                .csrf(csrf -> csrf.disable())

                // 요청에 대한 접근 권한 설정
                .authorizeHttpRequests(authz -> authz
                        .antMatchers(WHITELIST).permitAll() // 화이트리스트에 있는 경로는 누구나 접근 가능
                        .anyRequest().authenticated()      // 그 외 모든 요청은 인증된 사용자만 접근 가능
                )

                // .formLogin() 설정을 제거합니다.
                // 대신, 인증이 필요한 페이지에 미인증 사용자가 접근했을 때 로그인 페이지("/")로 보내도록 설정합니다.
                // 이 부분이 AuthFilter의 리다이렉트 로직을 대체합니다.
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(new org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint("/"))
                )

                // 로그아웃 설정
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/") // 로그아웃 성공 시 이동할 경로
                        .permitAll()
                );

        return http.build();
    }
}