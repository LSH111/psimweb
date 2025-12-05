# 주차이용실태/주차장 기본정보 컴포넌트 설계서

범위:
- `prk/usage-status-list` 화면(이용실태) 전 구간
- `prk/parkinglist` 및 온/오프/부설 상세(PrkDefPlceInfoController) 전 구간

## USG-C01. 주차이용실태 UI
- **개요**: JSP와 전용 JS로 검색 조건, 지도 마커, 카드 목록, 첨부 미리보기, 등록 탭 전환을 담당한다.

| ID | 클래스명 | 설명 |
| --- | --- | --- |
| USG-C01-CL01 | `WEB-INF/views/prk/usage-status-list.jsp` | 검색/필터, 지도/카드 레이아웃, 탭을 정의하는 뷰 템플릿. |
| USG-C01-CL02 | `static/js/page/usage-status-list.js` | Kakao Map 초기화, 검색 요청, 마커/카드 렌더링, 파일 미리보기, 탭 전환을 제어하는 페이지 스크립트. |
| USG-C01-CL03 | `static/js/page/usage-add.js` | 등록 탭에서 입력/검증/저장 호출을 담당하는 보조 스크립트. |

| ID | 인터페이스명 | 오퍼레이션명 | 구분 |
| --- | --- | --- | --- |
| USG-C01-IF01 | `SearchCodeUtils` | `loadSidoList`, `loadSigunguList`, `loadEmdList` | UI 헬퍼 |
| USG-C01-IF02 | `window.loadUsageStatusList` | 검색 폼 직렬화 후 목록/지도 갱신 | UI 진입점 |
| USG-C01-IF03 | `handleCardClick` | 카드 선택 시 지도 이동 및 마커 클릭 트리거 | UI 이벤트 |
| USG-C01-IF04 | `showImagePreview` | 첨부 썸네일 프리뷰 출력 | UI 이벤트 |

## USG-C02. 주차이용실태 Controller
- **개요**: 화면 진입 및 REST API 요청을 받아 서비스 계층을 호출하고 JSON/뷰를 반환한다.

| ID | 클래스명 | 설명 |
| --- | --- | --- |
| USG-C02-CL01 | `PrkUsageStatusController` | 목록 화면 렌더링, 목록/상세/첨부 조회, 저장, 삭제 API 제공. |

| ID | 인터페이스명 | 오퍼레이션명 | 구분 |
| --- | --- | --- | --- |
| USG-C02-IF01 | GET `/prk/usage-status-list` | 목록 화면 반환 | View |
| USG-C02-IF02 | GET `/prk/api/usage-status/list` | 검색 조건 기반 목록 조회 | REST |
| USG-C02-IF03 | GET `/prk/api/usage-status/detail` | 단건 상세 조회 | REST |
| USG-C02-IF04 | GET `/prk/api/usage-status/files` | 실태조사 첨부파일 목록 조회 | REST |
| USG-C02-IF05 | POST `/prk/api/usage-status/save` | 조사 데이터 및 첨부 저장 | REST |
| USG-C02-IF06 | DELETE `/prk/api/usage-status/delete` | 조사 데이터 삭제 | REST |

## USG-C03. 주차이용실태 Service
- **개요**: 비즈니스 로직 및 트랜잭션 경계를 제공하며 Mapper를 호출한다.

| ID | 클래스명 | 설명 |
| --- | --- | --- |
| USG-C03-CL01 | `PrkUsageStatusService` | 서비스 인터페이스. |
| USG-C03-CL02 | `PrkUsageStatusServiceImpl` | 인터페이스 구현, 트랜잭션 적용, Mapper 위임. |

| ID | 인터페이스명 | 오퍼레이션명 | 구분 |
| --- | --- | --- | --- |
| USG-C03-IF01 | `PrkUsageStatusService` | `getUsageStatusList(vo)` | Service |
| USG-C03-IF02 | `PrkUsageStatusService` | `getUsageStatusDetail(vo)` | Service |
| USG-C03-IF03 | `PrkUsageStatusService` | `insertUsageStatus(vo)` | Service |
| USG-C03-IF04 | `PrkUsageStatusService` | `updateUsageStatus(vo)` | Service |
| USG-C03-IF05 | `PrkUsageStatusService` | `deleteUsageStatus(vo)` | Service |

## USG-C04. 주차이용실태 Mapper
- **개요**: MyBatis Mapper와 XML로 DB 접근을 캡슐화한다.

| ID | 클래스명 | 설명 |
| --- | --- | --- |
| USG-C04-CL01 | `PrkUsageStatusMapper` | Mapper 인터페이스. |
| USG-C04-CL02 | `PrkUsageStatusMapper.xml` | SQL 정의, 검색 조건 필터(년도/행정구역/차량/적불 등) 포함. |

| ID | 인터페이스명 | 오퍼레이션명 | 구분 |
| --- | --- | --- | --- |
| USG-C04-IF01 | `PrkUsageStatusMapper` | `selectUsageStatusList(vo)` | DB |
| USG-C04-IF02 | `PrkUsageStatusMapper` | `selectUsageStatusDetail(vo)` | DB |
| USG-C04-IF03 | `PrkUsageStatusMapper` | `insertUsageStatus(vo)` | DB |
| USG-C04-IF04 | `PrkUsageStatusMapper` | `updateUsageStatus(vo)` | DB |
| USG-C04-IF05 | `PrkUsageStatusMapper` | `deleteUsageStatus(vo)` | DB |

## USG-C05. 첨부파일 관리 연계
- **개요**: 실태조사 사진 업로드/조회 시 파일 관리 서비스를 호출한다.

| ID | 클래스명 | 설명 |
| --- | --- | --- |
| USG-C05-CL01 | `AttchPicMngInfoService` | 파일 업로드, 메타데이터 저장/조회 지원. |
| USG-C05-CL02 | `AttchPicMngInfoVO` | 첨부파일 메타데이터 VO. |

| ID | 인터페이스명 | 오퍼레이션명 | 구분 |
| --- | --- | --- | --- |
| USG-C05-IF01 | `AttchPicMngInfoService` | `getAttchPicMngInfoListByCmplSn(cmplSn, "USG_PHOTO")` | Service |
| USG-C05-IF02 | `AttchPicMngInfoService` | `uploadAndSaveFilesForUsage(cmplSn, "USG_PHOTO", files, userId, ip)` | Service |

---
- 상호 연계: UI 컴포넌트는 Controller REST 인터페이스(USG-C02-IF02~06)를 호출하고, Controller는 Service 인터페이스(USG-C03)와 첨부파일 서비스(USG-C05)를 통해 Mapper(USG-C04)를 사용해 데이터를 조회/저장한다.

## PRK-C01. 주차장 기본정보 UI
- **개요**: 주차장 목록/검색, 탭 전환, 상세 iframe 로딩, CSV 내보내기/선택 전송 등 UI를 담당한다.

| ID | 클래스명 | 설명 |
| --- | --- | --- |
| PRK-C01-CL01 | `WEB-INF/views/prk/parking-list.jsp` | 목록/검색/탭을 포함한 메인 뷰. |
| PRK-C01-CL02 | `WEB-INF/views/prk/onparking.jsp` | 노상주차장 상세/편집 뷰. |
| PRK-C01-CL03 | `WEB-INF/views/prk/offparking.jsp` | 노외주차장 상세/편집 뷰. |
| PRK-C01-CL04 | `WEB-INF/views/prk/buildparking.jsp` | 부설주차장 상세/편집 뷰. |
| PRK-C01-CL05 | `static/js/page/parking-list.js` | 목록 화면 탭/검색/전송/내보내기/지도 복귀 제어. |
| PRK-C01-CL06 | `static/js/page/parking/onparking.js` | 노상 상세 화면 스크립트. |
| PRK-C01-CL07 | `static/js/page/parking/offparking.js` | 노외 상세 화면 스크립트. |
| PRK-C01-CL08 | `static/js/page/parking/buildparking.js` | 부설 상세 화면 스크립트. |

| ID | 인터페이스명 | 오퍼레이션명 | 구분 |
| --- | --- | --- | --- |
| PRK-C01-IF01 | `window.loadParkingList` | 검색 조건 직렬화 후 목록 조회 | UI 진입점 |
| PRK-C01-IF02 | `window.closeNewParkingTabAndGoList` | 신규 탭 닫기 후 목록 탭 활성/재조회 | UI 이벤트 |
| PRK-C01-IF03 | `CodeUtils` | `loadStatusList`, `loadPrkTypeList`, `loadSido/Sigungu/Emd` | UI 헬퍼 |
| PRK-C01-IF04 | `downloadCsv`, `sendSelected` 등 | 선택 전송/내보내기 트리거 | UI 액션 |

## PRK-C02. 주차장 기본정보 Controller
- **개요**: PrkDefPlceInfoController가 목록/지도 데이터, 상세 조회, 등록/수정(파일 업로드 포함), 상태 변경, 사진 조회를 처리한다.

| ID | 클래스명 | 설명 |
| --- | --- | --- |
| PRK-C02-CL01 | `PrkDefPlceInfoController` | 주차장 기본정보 전 구간 담당 컨트롤러. |

| ID | 인터페이스명 | 오퍼레이션명 | 구분 |
| --- | --- | --- | --- |
| PRK-C02-IF01 | GET `/prk/parkinglist` | 목록 화면 반환 (상세 탭 파라미터 지원) | View |
| PRK-C02-IF02 | GET `/prk/parking-data` | 검색 조건 목록 조회 | REST |
| PRK-C02-IF03 | GET `/prk/parking-map-data` | 지도용 목록 조회(좌표/행정구역 필터) | REST |
| PRK-C02-IF04 | GET `/prk/onparking-detail` | 노상 상세 조회 화면 | View |
| PRK-C02-IF05 | POST `/prk/onparking-update` | 노상 저장/수정 + 파일 업로드 | REST |
| PRK-C02-IF06 | GET `/prk/offparking-detail` | 노외 상세 조회 화면 | View |
| PRK-C02-IF07 | POST `/prk/offparking-update` | 노외 저장/수정 + 파일 업로드 | REST |
| PRK-C02-IF08 | GET `/prk/buildparking-detail` | 부설 상세 조회 화면 | View |
| PRK-C02-IF09 | POST `/prk/buildparking-update` | 부설 저장/수정 + 파일 업로드 | REST |
| PRK-C02-IF10 | POST `/prk/api/parking/update-status-pending` | 선택 주차장 상태 승인대기 처리 | REST |
| PRK-C02-IF11 | GET `/prk/parking-photos` | prkPlceInfoSn별 사진 메타 조회 | REST |
| PRK-C02-IF12 | GET `/prk/photo` | 주차장 사진 파일 반환 | REST |
| PRK-C02-IF13 | GET `/prk/debug/xml` | ParkingDetailVO 디버그 XML 반환 | REST(디버그) |

## PRK-C03. 주차장 기본정보 Service
- **개요**: 목록/상세, 관리번호 생성, 온/오프/부설 등록/수정, 상태 변경 로직을 제공하며 트랜잭션 경계를 잡는다.

| ID | 클래스명 | 설명 |
| --- | --- | --- |
| PRK-C03-CL01 | `PrkDefPlceInfoService` | 서비스 인터페이스. |
| PRK-C03-CL02 | `PrkDefPlceInfoServiceImpl` | 인터페이스 구현, 캐시/트랜잭션/검증 처리. |

| ID | 인터페이스명 | 오퍼레이션명 | 구분 |
| --- | --- | --- | --- |
| PRK-C03-IF01 | `getParkingList(params)` | 검색 목록 조회 | Service |
| PRK-C03-IF02 | `getParkingListForMap(params)` | 지도용 목록 조회 | Service |
| PRK-C03-IF03 | `getOnstreetParkingDetail(manageNo, infoSn)` | 노상 상세 | Service |
| PRK-C03-IF04 | `getOffstreetParkingDetail(manageNo, infoSn)` | 노외 상세 | Service |
| PRK-C03-IF05 | `getBuildParkingDetail(manageNo, infoSn)` | 부설 상세 | Service |
| PRK-C03-IF06 | `generatePrkPlceManageNo(zipCode, prkplceSe, operMbyCd, prkPlceType)` | 관리번호 생성 | Service |
| PRK-C03-IF07 | `insertOnstreetParking(vo)` | 노상 등록 | Service |
| PRK-C03-IF08 | `insertOffstreetParking(vo)` | 노외 등록 | Service |
| PRK-C03-IF09 | `insertBuildParking(vo)` | 부설 등록 | Service |
| PRK-C03-IF10 | `updateOnstreetParking(vo)` | 노상 수정 | Service |
| PRK-C03-IF11 | `updateOffstreetParking(vo)` | 노외 수정 | Service |
| PRK-C03-IF12 | `updateBuildParking(vo)` | 부설 수정 | Service |
| PRK-C03-IF13 | `updateSelectedStatusToPending(list)` | 선택 주차장 상태 일괄 변경 | Service |

## PRK-C04. 주차장 기본정보 Mapper
- **개요**: MyBatis Mapper 인터페이스/XML로 주차장 목록/상세/등록/수정/상태변경/관리번호 생성 쿼리를 캡슐화한다.

| ID | 클래스명 | 설명 |
| --- | --- | --- |
| PRK-C04-CL01 | `PrkDefPlceInfoMapper` | Mapper 인터페이스. |
| PRK-C04-CL02 | `PrkDefPlceInfoMapper.xml` | SQL 정의(목록/지도/상세, INSERT/UPDATE, 상태변경, 관리번호 생성). |

| ID | 인터페이스명 | 오퍼레이션명 | 구분 |
| --- | --- | --- | --- |
| PRK-C04-IF01 | `selectParkingList(params)` | 목록 조회 | DB |
| PRK-C04-IF02 | `selectParkingListForMap(params)` | 지도용 목록 조회 | DB |
| PRK-C04-IF03 | `selectOnstreetParkingDetail(manageNo, infoSn)` | 노상 상세 | DB |
| PRK-C04-IF04 | `selectOffstreetParkingDetail(manageNo, infoSn)` | 노외 상세 | DB |
| PRK-C04-IF05 | `selectBuildParkingDetail(manageNo, infoSn)` | 부설 상세 | DB |
| PRK-C04-IF06 | `generateParkingManageNo(zip, own, oper, type)` | 관리번호 생성 함수 호출 | DB |
| PRK-C04-IF07 | `insertOnstr*/Offstr*/Atch*/BizPer*` | 온/오프/부설/부속 INSERT 계열 | DB |
| PRK-C04-IF08 | `updateOnstr*/Offstr*/Atch*/BizPer*` | 온/오프/부설/부속 UPDATE 계열 | DB |
| PRK-C04-IF09 | `updateStatusToPending(params)` | 상태 일괄 변경 | DB |

## PRK-C05. 첨부/스토리지 연계
- **개요**: 주차장(온/오프/부설) 이미지 업로드·조회·다운로드를 처리한다.

| ID | 클래스명 | 설명 |
| --- | --- | --- |
| PRK-C05-CL01 | `AttchPicMngInfoService` | 주차장 사진 저장/조회, 파일 키 관리. |
| PRK-C05-CL02 | `PhotoStorage` | 실제 파일 시스템 리소스 로딩/전달. |

| ID | 인터페이스명 | 오퍼레이션명 | 구분 |
| --- | --- | --- | --- |
| PRK-C05-IF01 | `uploadAndSaveFile(prkPlceInfoSn, type, file)` | 주차장별 사진 업로드 | Service |
| PRK-C05-IF02 | `getPhotosByPrkPlceInfoSn(prkPlceInfoSn)` | 사진 메타 조회 | Service |
| PRK-C05-IF03 | `getPhotoFile(prkPlceInfoSn, prkImgId, seqNo)` | 파일 메타 조회 | Service |
| PRK-C05-IF04 | GET `/prk/photo` | 파일 스트림 반환 (Content-Disposition inline) | REST |

---
- 상호 연계(주차장 기본정보): UI(프론트 스크립트/JSP) → Controller(REST/View) → Service(비즈니스/검증/트랜잭션) → Mapper(DB) + 파일 서비스/스토리지(사진 업로드·반환) 순서로 협력한다.

## PRK-C06. 주차장 지도(GIS) 컴포넌트
- **개요**: `parkingmap.jsp`에서 Kakao Map 기반 주차장 시각화, 검색 패널, 목록-지도로 연계, 상세 진입을 담당한다.

| ID | 클래스명 | 설명 |
| --- | --- | --- |
| PRK-C06-CL01 | `WEB-INF/views/gis/parkingmap.jsp` | 지도 뷰 템플릿, 검색 패널/목록/지도 레이아웃 정의. |
| PRK-C06-CL02 | `static/js/page/parkingmap.js` (존재 시) 또는 인라인 스크립트 | Kakao Map 초기화, 마커/클러스터링, 검색 조건 적용, 목록-지도 싱크 제어. |

| ID | 인터페이스명 | 오퍼레이션명 | 구분 |
| --- | --- | --- | --- |
| PRK-C06-IF01 | GET `/gis/parkingmap` | 지도 화면 반환 | View |
| PRK-C06-IF02 | GET `/prk/parking-map-data` | 지도용 주차장 데이터 조회(시도/시군구 필터, 좌표 포함) | REST |
| PRK-C06-IF03 | `openDetailInList(openDetailId, parkingType)` | 지도에서 목록 화면 상세 탭 오픈(세션스토리지/파라미터 활용) | UI 이벤트 |
| PRK-C06-IF04 | `applyFiltersAndReload()` | 지도 검색 패널 조건을 적용해 지도/목록 갱신 | UI 액션 |

---
- 상호 연계(지도): GIS UI → `/prk/parking-map-data`(PRK-C02-IF03)로 데이터 로드 → Kakao Map 마커/클러스터 표시 → 상세 이동 시 `/prk/parkinglist` 탭 파라미터로 연계.

### `/prk/parking-map-data` 상세 설계
- **역할**: 지도에 표시할 주차장 목록을 반환한다. 좌표(lat/lon) 기반 마커 렌더링을 위해 좌표가 있는 데이터만 조회한다.
- **요청 파라미터**
  - `sidoCd`(optional): 시도 코드. 비어있으면 전체.
  - `sigunguCd`(optional): 시군구 코드. 비어있으면 시군구 필터 미적용.
  - 세션 `userBizList`를 내부에서 읽어 params에 포함해, 로그인 사용자의 사업 범위로 한정.
  - 내부에서 키 호환용으로 `sido`, `sigungu`도 동일 값으로 세팅.
- **처리 로직**
  - 공백 제거 후 시도/시군구 필터를 params에 추가.
  - `userBizList`가 있으면 params에 추가해 쿼리 제한.
  - `PrkDefPlceInfoService.getParkingListForMap(params)` 호출 → Mapper `selectParkingListForMap` 실행.
- **응답 JSON**
  - `success`: true/false
  - `list`: 주차장 배열(좌표 포함). 각 항목 예시 필드: `prkPlceManageNo`, `prkPlceInfoSn`, `prkplceNm`, `sidoCd`, `sigunguCd`, `emdCd`, `prkPlceLat`, `prkPlceLon`, `prkplceSe`, `prkPlceType`, `prgsStsCd` 등.
  - `totalCount`: `list` 길이
  - 오류 시 `message`, 빈 배열 반환
- **UI 사용 패턴**
  1) 지도 초기 로드 시 기본 호출(전체 또는 세션 범위).  
  2) 검색 패널에서 시도/시군구 변경 → `applyFiltersAndReload()`로 호출, 마커/클러스터 갱신.  
  3) 마커/리스트 클릭 시 `openDetailInList(openDetailId, parkingType)`로 `/prk/parkinglist`에 상세 탭 오픈(파라미터/세션스토리지 활용).  
