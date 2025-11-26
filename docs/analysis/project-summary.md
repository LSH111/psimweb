# Psim Project Summary

This document provides a high-level overview of the Psim project, including its technical stack, configuration, and architecture.

## 1. Project Overview

- **Group ID:** `com.psim`
- **Artifact ID:** `psim-web`
- **Version:** `0.1.0-SNAPSHOT`
- **Packaging:** `war`
- **Java Version:** 1.8
- **Framework:** Spring Boot 2.7.18

The project is a web application built using Spring Boot, designed to be packaged as a WAR file for deployment in a standalone servlet container like Tomcat.

## 2. Core Technologies

- **Backend:**
    - Spring Boot (Web, Security, Actuator)
    - Java 1.8
- **Data Access:**
    - MyBatis (`mybatis-spring-boot-starter`)
    - PostgreSQL JDBC Driver
- **View Layer:**
    - JSP (JavaServer Pages)
    - JSTL
- **Build & Dependency Management:**
    - Apache Maven
- **Logging:**
    - SLF4J with Logback
- **Special Dependencies:**
    - **eGovFrame RTE:** Utilizes components from the eGovFrame standard framework.
    - **Lombok:** Used to reduce boilerplate code.
    - **Commons Fileupload/IO:** For handling file uploads.

## 3. Configuration (`application.yml`)

- **Default Profile:** The application uses a `default` profile with configurations for local development.
- **Server:**
    - **Port:** 8080
    - **Context Path:** `/`
- **Database (PostgreSQL):**
    - **URL:** `jdbc:postgresql://localhost:5432/postgres`
    - **Username:** `postgres`
    - **Credentials:** The password is set in the configuration file but should be managed via environment variables in production.
    - **Connection Pool:** HikariCP is configured for efficient database connection management.
- **MyBatis:**
    - Mappers are located in `classpath:mappers/**/*.xml`.
    - `map-underscore-to-camel-case` is enabled for automatic column-to-field mapping.
- **File Uploads:**
    - **Path:** `/Users/isihyeong/upload/psim`
    - **Max Size:** 50MB
- **External APIs:**
    - A Kakao API key is configured, suggesting integration with Kakao services.

## 4. Logging

- **Root Level:** `INFO`
- **Application Level (`com.psim`):** `DEBUG`
- **Mapper Level:** `TRACE` for detailed SQL query logging.
- **Log File:** `logs/psim-web.log`

## 5. Architecture Notes

- The project follows a classic Spring MVC architecture.
- It combines modern Spring Boot practices with traditional JSP views.
- The presence of `egovframe.rte` dependencies indicates it may need to adhere to specific government software standards or reuse existing government framework components.
- The WAR packaging and `provided` scope for Tomcat dependencies suggest deployment to a standalone servlet container is the primary target, rather than using the embedded Tomcat server for production.
