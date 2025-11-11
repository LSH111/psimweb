package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.PrkDefPlceInfoMapper;
import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrkDefPlceInfoServiceImpl implements PrkDefPlceInfoService {

    private final PrkDefPlceInfoMapper prkDefPlceInfoMapper;

    // ========== 목록 조회 ==========

    @Override
    public List<ParkingListVO> getParkingList(Map<String, Object> params) {
        try {
            log.info("주차장 목록 조회 - 파라미터: {}", params);
            List<ParkingListVO> result = prkDefPlceInfoMapper.selectParkingList(params);
            log.info("✅ 주차장 목록 조회 완료: {}건", result.size());
            return result;
        } catch (Exception e) {
            log.error("❌ 주차장 목록 조회 실패", e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<ParkingListVO> getParkingListForMap(Map<String, Object> params) {
        try {
            log.info("지도용 주차장 목록 조회");
            return prkDefPlceInfoMapper.selectParkingListForMap(params);
        } catch (Exception e) {
            log.error("❌ 지도용 목록 조회 실패", e);
            return Collections.emptyList();
        }
    }

    // ========== 상세 조회 ==========

    @Override
    @Cacheable(value = "parkingDetail", key = "#prkPlceManageNo", unless = "#result == null")
    public ParkingDetailVO getOnstreetParkingDetail(String prkPlceManageNo) {
        try {
            log.info("노상주차장 상세 조회: {}", prkPlceManageNo);
            return prkDefPlceInfoMapper.selectOnstreetParkingDetail(prkPlceManageNo);
        } catch (Exception e) {
            log.error("❌ 노상주차장 조회 실패", e);
            return null;
        }
    }

    @Override
    @Cacheable(value = "parkingDetail", key = "#prkPlceManageNo", unless = "#result == null")
    public ParkingDetailVO getOffstreetParkingDetail(String prkPlceManageNo) {
        try {
            log.info("노외주차장 상세 조회: {}", prkPlceManageNo);
            return prkDefPlceInfoMapper.selectOffstreetParkingDetail(prkPlceManageNo);
        } catch (Exception e) {
            log.error("❌ 노외주차장 조회 실패", e);
            return null;
        }
    }

    @Override
    @Cacheable(value = "parkingDetail", key = "#prkPlceManageNo", unless = "#result == null")
    public ParkingDetailVO getBuildParkingDetail(String prkPlceManageNo) {
        try {
            log.info("부설주차장 상세 조회: {}", prkPlceManageNo);
            return prkDefPlceInfoMapper.selectBuildParkingDetail(prkPlceManageNo);
        } catch (Exception e) {
            log.error("❌ 부설주차장 조회 실패", e);
            return null;
        }
    }

    /**
     * DB 함수로 주차장 관리번호 생성
     * - fn_create_srvy_prk_plce_manage_no2() 함수 호출
     * - 내부와 외부에서 동일한 관리번호 생성 로직 사용
     */
    @Override
    public String generatePrkPlceManageNo(String zipCode, String prkplceSe, String operMbyCd, String prkPlceType) {
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("🔢 주차장 관리번호 생성 시작");
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("📥 입력 파라미터:");
        log.info("   - zipCode     : [{}] (length: {})", zipCode, zipCode != null ? zipCode.length() : "null");
        log.info("   - prkplceSe   : [{}] (length: {})", prkplceSe, prkplceSe != null ? prkplceSe.length() : "null");
        log.info("   - operMbyCd   : [{}] (length: {})", operMbyCd, operMbyCd != null ? operMbyCd.length() : "null");
        log.info("   - prkPlceType : [{}] (length: {})", prkPlceType, prkPlceType != null ? prkPlceType.length() : "null");

        try {
            // 파라미터 검증
            if (zipCode == null || zipCode.trim().isEmpty()) {
                log.error("❌ 검증 실패: 우편번호가 null 또는 빈 문자열");
                throw new IllegalArgumentException("우편번호가 필요합니다.");
            }
            if (prkplceSe == null || prkplceSe.trim().isEmpty()) {
                log.error("❌ 검증 실패: 관리주체 코드가 null 또는 빈 문자열");
                throw new IllegalArgumentException("관리주체(소유주체) 코드가 필요합니다.");
            }
            if (operMbyCd == null || operMbyCd.trim().isEmpty()) {
                log.error("❌ 검증 실패: 운영주체 코드가 null 또는 빈 문자열");
                throw new IllegalArgumentException("운영주체 코드가 필요합니다.");
            }
            if (prkPlceType == null || prkPlceType.trim().isEmpty()) {
                log.error("❌ 검증 실패: 주차장유형 코드가 null 또는 빈 문자열");
                throw new IllegalArgumentException("주차장유형 코드가 필요합니다.");
            }

            log.info("✅ 파라미터 검증 통과");
            log.info("🔄 DB 함수 fn_create_srvy_prk_plce_manage_no2 호출 중...");

            String manageNo = null;
            try {
                manageNo = prkDefPlceInfoMapper.generateParkingManageNo(zipCode, prkplceSe, operMbyCd, prkPlceType);
                log.info("📤 DB 함수 반환값: [{}]", manageNo);
            } catch (Exception dbException) {
                log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                log.error("❌❌❌ DB 함수 호출 중 예외 발생 ❌❌❌");
                log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                log.error("예외 타입: {}", dbException.getClass().getName());
                log.error("예외 메시지: {}", dbException.getMessage());
                log.error("상세 스택:", dbException);

                // 🔥 SQL 관련 예외 정보 추출
                Throwable cause = dbException.getCause();
                while (cause != null) {
                    log.error("  └─ Caused by: {} - {}", cause.getClass().getName(), cause.getMessage());
                    cause = cause.getCause();
                }

                throw new RuntimeException("DB 함수 호출 실패: " + dbException.getMessage(), dbException);
            }

            if (manageNo == null || manageNo.trim().isEmpty()) {
                log.error("❌ DB 함수가 null 또는 빈 문자열 반환");
                throw new RuntimeException("주차장 관리번호 생성 실패: 생성된 번호가 없습니다.");
            }

            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.info("✅✅✅ 주차장 관리번호 생성 성공: [{}]", manageNo);
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            return manageNo;

        } catch (IllegalArgumentException e) {
            log.error("❌ 파라미터 검증 실패: {}", e.getMessage());
            throw new RuntimeException("주차장 관리번호 생성 실패: " + e.getMessage(), e);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ 예상치 못한 예외 발생", e);
            throw new RuntimeException("주차장 관리번호 생성 실패: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            timeout = 60,
            rollbackFor = Exception.class
    )
    public void insertOnstreetParking(ParkingDetailVO vo) {
        try {
            // 🔥 STEP 0: prkPlceInfoSn 생성
            log.info("🔵 [STEP 0/4] prkPlceInfoSn 생성 시작");
            Integer newSn = prkDefPlceInfoMapper.generateParkingInfoSn(vo.getPrkPlceManageNo());
            vo.setPrkPlceInfoSn(newSn);

            if (vo.getPrkPlceInfoSn() == null || vo.getPrkPlceInfoSn() <= 0) {
                log.error("❌ prkPlceInfoSn이 생성되지 않았습니다: {}", vo.getPrkPlceInfoSn());
                throw new RuntimeException("주차장 일련번호 생성 실패");
            }
            log.info("✅ [STEP 0/4] prkPlceInfoSn 생성 완료: {}", newSn);

            // 🔥 STEP 1: 기본 정보 INSERT
            log.info("🔵 [STEP 1/4] tb_prk_def_plce_info INSERT 시작");
            log.info("📥 입력 데이터 검증:");
            log.info("   - prkPlceManageNo: {}", vo.getPrkPlceManageNo());
            log.info("   - prkplceNm: {}", vo.getPrkplceNm());
            log.info("   - ldongCd: {}", vo.getLdongCd());
            log.info("   - zip: {}", vo.getZip());
            log.info("   - dtadd: {}", vo.getDtadd());
            log.info("   - prkPlceLat: {}", vo.getPrkPlceLat());
            log.info("   - prkPlceLon: {}", vo.getPrkPlceLon());

            prkDefPlceInfoMapper.insertPrkDefPlceInfo(vo);
            log.info("✅ [STEP 1/4] tb_prk_def_plce_info INSERT 완료");

            // 🔥 STEP 2: 사업별 주차장 정보 INSERT
            log.info("🔵 [STEP 2/4] tb_biz_per_prklot_info INSERT 시작");
            log.info("📥 입력 데이터:");
            log.info("   - prkBizMngNo: {}", vo.getPrkBizMngNo());
            log.info("   - bizPerPrkMngNo: {}", vo.getBizPerPrkMngNo());
            log.info("   - prgsStsCd: {}", vo.getPrgsStsCd() != null ? vo.getPrgsStsCd() : "10");

            prkDefPlceInfoMapper.insertBizPerPrklotInfo(vo);
            log.info("✅ [STEP 2/4] tb_biz_per_prklot_info INSERT 완료");

            // 🔥 STEP 3: 노상주차장 기본 정보 INSERT
            log.info("🔵 [STEP 3/4] tb_onstr_prklot_info INSERT 시작");
            log.info("📥 주차면수 데이터:");
            log.info("   - totPrkCnt: {}", vo.getTotPrkCnt());
            log.info("   - prkOperMthdCd: {}", vo.getPrkOperMthdCd());
            log.info("   - operMbyCd: {}", vo.getOperMbyCd());
            log.info("   - mgrOrg: {}", vo.getMgrOrg());
            log.info("   - mgrOrgTelNo: {}", vo.getMgrOrgTelNo());

            prkDefPlceInfoMapper.insertOnstrPrklotInfo(vo);
            log.info("✅ [STEP 3/4] tb_onstr_prklot_info INSERT 완료");

            // 🔥 STEP 4: 노상주차장 운영 정보 INSERT
            log.info("🔵 [STEP 4/4] tb_onstr_prklot_oper_info INSERT 시작");
            log.info("📥 운영 정보 데이터 (주간):");
            log.info("   - dyntDvCd: {}", vo.getDyntDvCd());
            log.info("   - wkZon: {}", vo.getWkZon());
            log.info("   - wkFeeAplyCd: {}", vo.getWkFeeAplyCd());
            log.info("   - wkFeeMthdCd: {}", vo.getWkFeeMthdCd());
            log.info("📥 운영 정보 데이터 (야간):");
            log.info("   - ntZon: {}", vo.getNtZon());
            log.info("   - ntFeeAplyCd: {}", vo.getNtFeeAplyCd());
            log.info("   - ntFeeMthdCd: {}", vo.getNtFeeMthdCd());

            prkDefPlceInfoMapper.insertOnstrPrklotOperInfo(vo);
            log.info("✅ [STEP 4/4] tb_onstr_prklot_oper_info INSERT 완료");

            log.info("🎉🎉🎉 노상주차장 4단계 INSERT 모두 성공");

        } catch (Exception e) {
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("❌❌❌ 노상주차장 INSERT 실패");
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("예외 타입: {}", e.getClass().getName());
            log.error("예외 메시지: {}", e.getMessage());
            log.error("상세 스택:", e);

            Throwable cause = e.getCause();
            while (cause != null) {
                log.error("  └─ Caused by: {} - {}", cause.getClass().getName(), cause.getMessage());
                cause = cause.getCause();
            }

            throw new RuntimeException("노상주차장 등록 실패: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void insertOffstreetParking(ParkingDetailVO vo) {
        try {
            log.info("🆕 노외주차장 INSERT: {}", vo.getPrkPlceManageNo());
            prkDefPlceInfoMapper.insertOffstreetParking(vo);
            log.info("✅ 노외주차장 INSERT 완료 - SN: {}", vo.getPrkPlceInfoSn());
        } catch (Exception e) {
            log.error("❌ 노외주차장 INSERT 실패", e);
            throw new RuntimeException("노외주차장 등록 실패", e);
        }
    }

    @Override
    @Transactional
    public void insertBuildParking(ParkingDetailVO vo) {
        try {
            log.info("🆕 부설주차장 INSERT: {}", vo.getPrkPlceManageNo());
            prkDefPlceInfoMapper.insertBuildParking(vo);
            log.info("✅ 부설주차장 INSERT 완료 - SN: {}", vo.getPrkPlceInfoSn());
        } catch (Exception e) {
            log.error("❌ 부설주차장 INSERT 실패", e);
            throw new RuntimeException("부설주차장 등록 실패", e);
        }
    }

    // ========== 수정 ==========

    @Override
    @Transactional(timeout = 30)
    @CacheEvict(value = "parkingDetail", key = "#parkingData.prkPlceManageNo")
    public void updateOnstreetParking(ParkingDetailVO parkingData) {
        try {
            log.info("🔄 노상주차장 UPDATE: {}", parkingData.getPrkPlceManageNo());

            prkDefPlceInfoMapper.updatePrkDefPlceInfo(parkingData);
            prkDefPlceInfoMapper.updateOnstrPrklotInfo(parkingData);
            prkDefPlceInfoMapper.updateOnstrPrklotOperInfo(parkingData);
            prkDefPlceInfoMapper.updateBizPerPrklotPrgsSts(parkingData);

            log.info("✅ 노상주차장 UPDATE 완료");
        } catch (Exception e) {
            log.error("❌ 노상주차장 UPDATE 실패", e);
            throw new RuntimeException("노상주차장 수정 실패", e);
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "parkingDetail", key = "#parkingData.prkPlceManageNo")
    public void updateOffstreetParking(ParkingDetailVO parkingData) {
        try {
            log.info("🔄 노외주차장 UPDATE: {}", parkingData.getPrkPlceManageNo());

            prkDefPlceInfoMapper.updatePrkDefPlceInfo(parkingData);
            prkDefPlceInfoMapper.updateOffstrPrklotInfo(parkingData);
            prkDefPlceInfoMapper.updateOffstrPrklotOperInfo(parkingData);

            log.info("✅ 노외주차장 UPDATE 완료");
        } catch (Exception e) {
            log.error("❌ 노외주차장 UPDATE 실패", e);
            throw new RuntimeException("노외주차장 수정 실패", e);
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "parkingDetail", key = "#parkingData.prkPlceManageNo")
    public void updateBuildParking(ParkingDetailVO parkingData) {
        try {
            log.info("🔄 부설주차장 UPDATE: {}", parkingData.getPrkPlceManageNo());

            prkDefPlceInfoMapper.updatePrkDefPlceInfo(parkingData);
            prkDefPlceInfoMapper.updateAtchPrklotInfo(parkingData);
            prkDefPlceInfoMapper.updateAtchPrklotOperInfo(parkingData);
            prkDefPlceInfoMapper.updateBizPerPrklotPrgsSts(parkingData);

            log.info("✅ 부설주차장 UPDATE 완료");
        } catch (Exception e) {
            log.error("❌ 부설주차장 UPDATE 실패", e);
            throw new RuntimeException("부설주차장 수정 실패", e);
        }
    }

    // ========== 상태 변경 ==========

    @Override
    @Transactional
    public int updateSelectedStatusToPending(List<String> manageNoList) {
        if (manageNoList == null || manageNoList.isEmpty()) {
            return 0;
        }

        try {
            log.info("🔄 {}개 주차장 상태 변경 → 승인 대기", manageNoList.size());
            int count = prkDefPlceInfoMapper.updateStatusToPending(manageNoList);
            log.info("✅ 상태 변경 완료: {}건", count);
            return count;
        } catch (Exception e) {
            log.error("❌ 상태 변경 실패", e);
            throw new RuntimeException("상태 변경 실패", e);
        }
    }
}