# 클래스 다이어그램 가이드 (한글)

프로젝트 클래스 구조를 PlantUML로 관리하며, 다이어그램을 빠르게 생성할 수 있도록 핵심 패키지와 의존 흐름을 정리했다.

## 다이어그램 소스와 생성 방법

- 소스 파일: `src/test/resources/psim-class-diagram.puml`
- 필요 도구: Graphviz(`dot`)가 없으면 설치 필요 (예: macOS `brew install graphviz`)
- 생성 명령(프로젝트 루트에서 실행):

```bash
mvn -Pdiagrams generate-resources
 
```

- 출력 위치: `target/diagrams/psim-class-diagram.svg`(뷰잉), `target/diagrams/psim-class-diagram.xmi`(Amateras UML 등에서 편집)

## 패키지 구조 요약

- `com.psim`: `PsimWebApplication`이 스프링 부트 진입점.
- `com.psim.config`: 보안/웹/DB/MyBatis/RestClient 설정과 `AuthInterceptor`, `DatabaseHealthIndicator` 등 인프라 지원 클래스.
- `com.psim.media.storage`: 사진 저장용 인터페이스 `PhotoStorage`와 파일 시스템 구현체 `FileSystemPhotoStorage`.
- `com.psim.integration.geocoding`: 카카오 연동. `GeocodingClient` 인터페이스와 구현 `KakaoGeocodingClient`, 설정 `GeocodingConfig`, 속성
  `KakaoGeocodingProperties`, 모델(`GeoAddress`, `GeoCoordinate`, `GeoRegion`) 및 `GeocodingException`.
- `com.psim.web.api`: 카카오 주소/좌표 API. `KakaoLocalController` → `KakaoLocalService`(인터페이스) → `KakaoLocalServiceImpl`이
  `GeocodingClient`를 호출하여 VO(`KakaoCoord2AddressResponse`, `KakaoCoord2RegionResponse`, `KakaoAddress2CoordResponse`)를
  반환.
- `com.psim.web.cmm`: 공통 UI 및 인증. 컨트롤러(`IndexController`, `LoginController`, `CoCodeController`,
  `ErrorPageController`) → 서비스 인터페이스/구현(`IndexService*`, `LoginService*`, `CoCodeService*`, `PasswordCryptoService*`,
  `LoginAttemptPolicy*`) → MyBatis 매퍼(`IndexMapper`, `LoginMapper`, `CoCodeMapper`, `CoUserMapper`) → VO(`CoUserVO`,
  `CoAuthVO`, `CoAuthMenuVO`, `CoAuthTargetVO`, `CoMenuVO`, `CoCodeVO`, `CoCodeGroupVO`, `CoLdongVO`, `CoAddrVO`,
  `CoAddrJibunVO`, `CoZipVO`, `CoComboVO`). 예외 처리(`GlobalExceptionHandler`, `RestExceptionHandler`), `AuthFilter`는 폐기
  예정.
- `com.psim.web.prk`: 주차장 정보/사용 현황. 컨트롤러(`PrkDefPlceInfoController`, `PrkUsageStatusController`) → 서비스 인터페이스/구현 → 매퍼(
  `PrkDefPlceInfoMapper`, `PrkUsageStatusMapper`) → VO(`ParkingListVO`, `ParkingDetailVO`, `PrkUsageStatusVO`).
- `com.psim.web.file`: 파일 업로드. `FileUploadController` → `AttchPicMngInfoService`(인터페이스/구현) → `AttchPicMngInfoMapper`와
  `PhotoStorage` 구현을 사용, VO는 `AttchPicMngInfoVO`.

## 관계 그리기 메모

- 모든 컨트롤러는 해당 서비스 인터페이스에 의존하며, 구현체(`*Impl`)가 실제 로직을 담당.
- 서비스 구현은 주로 MyBatis 매퍼에 의존해 DB 접근하며, 외부 연동(`GeocodingClient`)이나 인프라(`PhotoStorage`, `PasswordCryptoService`,
  `LoginAttemptPolicy`)를 주입받아 사용.
- 매퍼는 VO 객체로 결과를 매핑한다. 각 VO는 주로 데이터 운반용이며 비즈니스 로직은 없다.
- `AuthInterceptor`는 `WebMvcConfig`에서 등록되어 인증/권한 체크를 수행하고, 예외는 공통 핸들러에서 처리.
- 파일 업로드 경로/저장은 `PhotoStorage` 추상화 뒤에 숨겨져 있어 필요 시 다른 저장소 구현으로 교체 가능.

## 유지 및 업데이트 체크리스트

- 새로운 컨트롤러/서비스/매퍼/VO 추가 시 `psim-class-diagram.puml`에 패키지와 관계를 함께 추가.
- 설정 클래스나 인프라 컴포넌트(보안, DB, 스토리지) 변경 시 의존 화살표를 최신 상태로 맞춘 뒤 `mvn -Pdiagrams generate-resources`로 SVG/XMI를 다시 생성.
- 다이어그램은 문서와 코드의 단일 진실 소스이므로, 코드 구조가 바뀌면 즉시 UML을 갱신한다.
