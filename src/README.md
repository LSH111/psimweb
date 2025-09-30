# PSIM Web (WildFly 10, Java 8, Spring Boot 2.7, JSP, MyBatis, PostgreSQL)

## 빌드
```
mvn -DskipTests -Dspring-boot.repackage.skip=true clean package
# 산출물: target/psim-web.war
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

## 패키지 구조
- `controller/`, `service/`, `service/impl/`, `vo/`, `mapper/`
- `resources/mappers/*.xml` (iBATIS 스타일 SQL)
- `WEB-INF/views/*.jsp` + `static/css/*` (CSS 분할), `static/js/main.js`
