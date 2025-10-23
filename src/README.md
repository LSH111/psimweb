# PSIM Web (WildFly 10, Java 8, Spring Boot 2.7, JSP, MyBatis, PostgreSQL)

## 빌드
  ```
mvn -DskipTests -Dspring-boot.repackage.skip=true clean package
  ```

## 데이터소스(JNDI)
- WildFly 관리콘솔 → Configuration → Subsystems → Datasources
- PostgreSQL 드라이버 등록 후 Datasource 생성
  - JNDI: `java:/jdbc/pism`
  - 연결정보 입력 → Test Connection

## 배포
- 콘솔: Deployments → Add → `target/psim-web.war` → Enable
- 또는 파일복사:
  ```
  cp target/psim-web.war $JBOSS_HOME/standalone/deployments/
  ```

## 라우팅
- `/` → `redirect:/login` (index.jsp 없음)
- `/login` → `ts_login.jsp`
- `/parking/map` → `parkingmap.jsp`
- `/parking/list` → `parking-list.jsp`
- `/parking/on` → `onparking.jsp`
- `/parking/off` → `offparking.jsp`
- `/parking/build` → `buildparking.jsp`
  
## 프로젝트 구조
```
psim-web/
├── src/main/
│   ├── java/com/psim/web/
│   │   ├── PsimWebApplication.java           # Spring Boot 메인 클래스
│   │   ├── config/                           # 설정 클래스들
│   │   │   ├── WebMvcConfig.java            # Spring MVC 설정 (정적리소스, JSP 뷰리졸버)
│   │   │   ├── MyBatisConfig.java           # MyBatis 설정 (매퍼 스캔, SQL 세션 팩토리)
│   │   │   ├── DatabaseConfig.java          # HikariCP 데이터베이스 설정
│   │   │   ├── AuthInterceptor.java         # 인증 인터셉터
│   │   │   ├── DatabaseHealthIndicator.java # 데이터베이스 헬스체크
│   │   │   └── DatabaseMonitoringConfig.java # 데이터베이스 모니터링
│   │   ├── api/                             # API 관련 패키지
│   │   ├── cmm/                             # 공통(Common) 모듈
│   │   │   ├── vo/                          # 공통 Value Object
│   │   │   │   ├── CoUserVO.java           # 사용자 VO
│   │   │   │   ├── CoCodeVO.java           # 공통코드 VO  
│   │   │   │   └── CoLdongVO.java          # 법정동 VO
│   │   │   ├── filter/                      # 필터 클래스
│   │   │   ├── mapper/                      # MyBatis 매퍼 인터페이스
│   │   │   │   ├── IndexMapper.java        # 메인 화면 매퍼
│   │   │   │   ├── LoginMapper.java        # 로그인 매퍼
│   │   │   │   ├── CoCodeMapper.java       # 공통코드 매퍼
│   │   │   │   └── CoUserMapper.java       # 사용자 매퍼
│   │   │   ├── service/                     # 서비스 인터페이스 & 구현체
│   │   │   │   ├── IndexService.java       # 메인 화면 서비스
│   │   │   │   ├── CoCodeService.java      # 공통코드 서비스
│   │   │   │   └── impl/                    # 서비스 구현체
│   │   │   │       ├── IndexServiceImpl.java
│   │   │   │       └── CoCodeServiceImpl.java
│   │   │   └── controller/                  # 컨트롤러
│   │   │       ├── IndexController.java    # 메인 & 로그인 컨트롤러
│   │   │       └── CoCodeController.java   # 공통코드 API 컨트롤러
│   │   ├── prk/                             # 주차 관련 패키지
│   │   │   ├── vo/                          # 주차 관련 VO
│   │   │   │   └── ParkingListVO.java      # 주차장 목록 VO
│   │   │   ├── mapper/                      # 주차 매퍼
│   │   │   │   └── PrkDefPlceInfoMapper.java # 주차장 정보 매퍼
│   │   │   ├── service/                     # 주차 서비스
│   │   │   │   └── ParkingService.java     # 주차장 서비스
│   │   │   └── controller/                  # 주차 컨트롤러
│   │   │       └── ParkingController.java  # 주차장 관리 컨트롤러
│   │   └── file/                            # 파일 관련 패키지
│   │       ├── vo/                          # 파일 VO
│   │       ├── mapper/                      # 파일 매퍼
│   │       ├── service/                     # 파일 서비스
│   │       └── controller/                  # 파일 컨트롤러
│   ├── webapp/
│   │   ├── WEB-INF/
│   │   │   ├── views/                       # JSP 뷰 파일들
│   │   │   │   ├── cmm/                     # 공통 JSP
│   │   │   │   │   ├── index.jsp           # 메인 화면
│   │   │   │   │   └── ts_login.jsp        # 로그인 화면
│   │   │   │   ├── gis/                     # GIS 관련 JSP
│   │   │   │   ├── prk/                     # 주차 관련 JSP
│   │   │   │   │   ├── parkingmap.jsp      # 주차장 지도
│   │   │   │   │   ├── parking-list.jsp    # 주차장 목록
│   │   │   │   │   ├── onparking.jsp       # 노상주차 관리
│   │   │   │   │   ├── offparking.jsp      # 노외주차 관리
│   │   │   │   │   └── buildparking.jsp    # 부설주차 관리
│   │   │   │   ├── fragments/               # JSP 공통 프래그먼트
│   │   │   │   │   ├── header.jsp          # 공통 헤더
│   │   │   │   │   └── footer.jsp          # 공통 푸터
│   │   │   │   └── krds-uiux-main/          # UI/UX 디자인 템플릿
│   │   │   ├── web.xml                      # 웹 애플리케이션 설정
│   │   │   ├── jboss-web.xml               # JBoss/WildFly 웹 설정 (컨텍스트 루트)
│   │   │   └── jboss-deployment-structure.xml # JBoss 배포 구조 (라이브러리 제외)
│   │   └── static/                          # 웹 정적 리소스
│   └── resources/
│       ├── mappers/                         # MyBatis XML 매퍼 파일들
│       │   ├── cmm/                         # 공통 모듈 매퍼 XML
│       │   │   ├── IndexMapper.xml         # 메인 화면 쿼리
│       │   │   ├── LoginMapper.xml         # 로그인 쿼리
│       │   │   ├── CoCodeMapper.xml        # 공통코드 쿼리
│       │   │   └── CoUserMapper.xml        # 사용자 쿼리
│       │   ├── api/                         # API 관련 매퍼 XML
│       │   ├── prk/                         # 주차 관련 매퍼 XML
│       │   │   └── PrkDefPlceInfoMapper.xml # 주차장 정보 쿼리
│       │   └── file/                        # 파일 관련 매퍼 XML
│       ├── static/                          # 정적 리소스 (CSS, JS, 이미지)
│       │   ├── css/                         # 스타일시트
│       │   │   └── pages/                   # 페이지별 CSS
│       │   │       └── parkingmap.css      # 주차장 지도 스타일
│       │   ├── js/                          # JavaScript 파일
│       │   └── img/                         # 이미지 파일
│       ├── application.yml                  # 메인 설정 파일 (공통)
│       ├── application-dev.yml              # 개발환경 설정
│       ├── application-prod.yml             # 운영환경 설정
│       └── logback-spring.xml              # 로그백 로깅 설정
├── target/                                  # Maven 빌드 결과물
│   └── psim-web.war                        # WAR 배포 파일
├── logs/                                    # 애플리케이션 로그 파일
├── .mvn/                                    # Maven Wrapper 설정
├── .idea/                                   # IntelliJ IDEA 설정
├── pom.xml                                  # Maven 빌드 설정
├── psim.iml                                # IntelliJ 모듈 파일
├── .gitignore                              # Git 제외 파일 목록
└── README.md                                # 프로젝트 문서
```
## 주요 라이브러리 및 기술 스택

### 프레임워크 및 라이브러리
- **Spring Boot 2.7.x**: 애플리케이션 프레임워크
- **Spring MVC**: 웹 MVC 프레임워크
- **MyBatis**: SQL 매핑 프레임워크 (iBATIS 스타일)
- **Project Lombok**: Java 보일러플레이트 코드 자동 생성
- **Logback**: 로깅 프레임워크 (SLF4J 구현체)

### 데이터베이스 및 연결
- **PostgreSQL**: 메인 데이터베이스
- **HikariCP**: 커넥션 풀 (Spring Boot 기본)
- **JNDI**: WildFly 데이터소스 연동 (`java:/jdbc/pism`)

### 웹 기술
- **JSP**: 뷰 템플릿 엔진
- **JSTL**: JSP 표준 태그 라이브러리
- **Bootstrap/CSS3**: 프론트엔드 스타일링
- **JavaScript**: 클라이언트 사이드 스크립팅

### 애플리케이션 서버
- **WildFly 10**: Java EE 애플리케이션 서버
- **Java 8**: 런타임 환경

### 빌드 및 패키지 관리
- **Apache Maven**: 프로젝트 빌드 및 의존성 관리
- **WAR 패키징**: WildFly 배포를 위한 웹 아카이브

## 패키지 구조 설명
- **config/**: Spring 설정 클래스들 (웹, DB, MyBatis, 인터셉터)
- **cmm/**: 공통 모듈 (Common) - 로그인, 코드 관리 등
- **prk/**: 주차 관련 비즈니스 로직
- **file/**: 파일 업로드/다운로드 관련 기능
- **api/**: REST API 엔드포인트
- **mappers/**: MyBatis XML 매퍼 파일들
- **static/**: CSS, JavaScript, 이미지 등 정적 자원