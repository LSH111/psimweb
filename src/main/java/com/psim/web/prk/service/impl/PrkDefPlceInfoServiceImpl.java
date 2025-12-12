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
import java.util.HashMap;
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

    @Override
    public int countParkingListForMap(Map<String, Object> params) {
        try {
            return prkDefPlceInfoMapper.countParkingListForMap(params);
        } catch (Exception e) {
            log.error("❌ 지도용 목록 건수 조회 실패", e);
            return 0;
        }
    }

    @Override
    public int countParkingListForMapAll() {
        try {
            return prkDefPlceInfoMapper.countParkingListForMapAll();
        } catch (Exception e) {
            log.error("❌ 전체 지도용 건수 조회 실패", e);
            return 0;
        }
    }

    // ========== 상세 조회 ==========

    @Override
    @Cacheable(value = "parkingDetail", key = "#prkPlceManageNo + ':' + #prkPlceInfoSn", unless = "#result == null")
    public ParkingDetailVO getOnstreetParkingDetail(String prkPlceManageNo, Long prkPlceInfoSn) {
        try {
            log.info("노상주차장 상세 조회: {} / {}", prkPlceManageNo, prkPlceInfoSn);
            return prkDefPlceInfoMapper.selectOnstreetParkingDetail(prkPlceManageNo, prkPlceInfoSn);
        } catch (Exception e) {
            log.error("❌ 노상주차장 조회 실패", e);
            return null;
        }
    }

    @Override
    @Cacheable(value = "parkingDetail", key = "#prkPlceManageNo + ':' + #prkPlceInfoSn", unless = "#result == null")
    public ParkingDetailVO getOffstreetParkingDetail(String prkPlceManageNo, Long prkPlceInfoSn) {
        try {
            log.info("노외주차장 상세 조회: {} / {}", prkPlceManageNo, prkPlceInfoSn);
            return prkDefPlceInfoMapper.selectOffstreetParkingDetail(prkPlceManageNo, prkPlceInfoSn);
        } catch (Exception e) {
            log.error("❌ 노외주차장 조회 실패", e);
            return null;
        }
    }

    @Override
    @Cacheable(value = "parkingDetail", key = "#prkPlceManageNo + ':' + #prkPlceInfoSn", unless = "#result == null")
    public ParkingDetailVO getBuildParkingDetail(String prkPlceManageNo, Long prkPlceInfoSn) {
        try {
            log.info("부설주차장 상세 조회: {} / {}", prkPlceManageNo, prkPlceInfoSn);
            return prkDefPlceInfoMapper.selectBuildParkingDetail(prkPlceManageNo, prkPlceInfoSn);
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

            log.info("✅ 파라미터 검증 통과 - ownCd={}", prkplceSe);
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

    private String ensureOwnCd(ParkingDetailVO vo) {
        String ownCd = vo.getOwnCd();
        if (ownCd == null || ownCd.trim().isEmpty()) {
            ownCd = vo.getPrkplceSe();
        }
        if (ownCd == null || ownCd.trim().isEmpty()) {
            // 입력이 없으면 공영(1)으로 기본 설정
            ownCd = "1";
            log.warn("⚠️ 관리주체 코드가 없어 기본값(1)으로 설정합니다.");
        }
        String normalized = ownCd.trim();
        vo.setOwnCd(normalized);
        vo.setPrkplceSe(normalized);
        log.info("✅ 파라미터 검증 완료 - ownCd={}", normalized);
        return normalized;
    }

    private String clean(String value, int maxLength) {
        if (value == null) return null;
        String trimmed = value.trim();
        if (trimmed.isEmpty()) return null;
        if (maxLength > 0 && trimmed.length() > maxLength) {
            String cut = trimmed.substring(0, maxLength);
            log.warn("⚠️ 길이 제한({})으로 값이 잘립니다. 원본='{}', 결과='{}'", maxLength, trimmed, cut);
            return cut;
        }
        return trimmed;
    }

    private void ensureAdminCodes(ParkingDetailVO vo) {
        if (vo.getSidoCd() == null || vo.getSidoCd().trim().isEmpty()) {
            throw new IllegalArgumentException("sidoCd(시도코드)는 필수입니다.");
        }
        if (vo.getSigunguCd() == null || vo.getSigunguCd().trim().isEmpty()) {
            throw new IllegalArgumentException("sigunguCd(시군구코드)는 필수입니다.");
        }
        if (vo.getEmdCd() == null || vo.getEmdCd().trim().isEmpty()) {
            throw new IllegalArgumentException("emdCd(읍면동코드)는 필수입니다.");
        }
    }

    private String normalizeCodeList(String codes, int maxLength) {
        if (codes == null) return null;
        String[] parts = codes.split(",");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            String token = p.trim();
            if (token.isEmpty()) continue;
            if (token.startsWith("기타")) continue;
            if (sb.length() > 0) sb.append(",");
            sb.append(token);
        }
        return clean(sb.toString(), maxLength);
    }

    private String buildBizPerPrkMngNo(ParkingDetailVO vo) {
        String candidate = vo.getBizPerPrkMngNo();
        if (candidate == null || candidate.trim().isEmpty()) {
            candidate = "BP" + System.currentTimeMillis();
        }
        return candidate.trim();
    }

    private void ensureManageNoUnique(ParkingDetailVO vo) {
        String manageNo = vo.getPrkPlceManageNo();
        if (manageNo == null || manageNo.trim().isEmpty()) {
            throw new IllegalArgumentException("주차장관리번호가 없습니다.");
        }
        String normalized = manageNo.trim();
        vo.setPrkPlceManageNo(normalized);

        int exists = prkDefPlceInfoMapper.countByManageNo(normalized);
        if (exists > 0) {
            log.error("❌ 주차장관리번호 중복 감지: {}", normalized);
            throw new IllegalArgumentException("주차장관리번호가 중복되어 등록할 수 없습니다.");
        }
    }

    private void applyBizPerIdentifiers(ParkingDetailVO vo) {
        String prkBizMngNo = vo.getPrkBizMngNo();
        if (prkBizMngNo != null && prkBizMngNo.trim().length() > 14) {
            throw new IllegalArgumentException("사업관리번호(prk_biz_mng_no)는 14자 이내여야 합니다.");
        }
        vo.setPrkBizMngNo(prkBizMngNo != null ? prkBizMngNo.trim() : null);

        // 관리번호는 생성값 그대로 사용 (tail 유지)
        String manageNo = vo.getPrkPlceManageNo();
        vo.setPrkPlceManageNo(manageNo);

        String bizPerNo = buildBizPerPrkMngNo(vo);
        if (bizPerNo != null && bizPerNo.trim().length() > 18) {
            throw new IllegalArgumentException("사업별주차관리번호(biz_per_prk_mng_no)는 18자 이내여야 합니다.");
        }
        vo.setBizPerPrkMngNo(bizPerNo != null ? bizPerNo.trim() : null);
    }

    private String normalizeDigits(String value) {
        if (value == null) {
            return null;
        }
        String digits = value.replaceAll("\\D", "");
        return digits.isEmpty() ? null : digits;
    }

    private String normalizeSegment(String value, int length, String defaultValue) {
        String digits = normalizeDigits(value);
        if (digits == null || digits.isEmpty()) {
            return defaultValue;
        }
        if (digits.length() > length) {
            return digits.substring(0, length);
        }
        if (digits.length() < length) {
            return String.format("%" + length + "s", digits).replace(' ', '0');
        }
        return digits;
    }

    private String resolveLdongCd(ParkingDetailVO vo) {
        String sigungu = normalizeSegment(vo.getSigunguCd(), 5, null);
        String emd = normalizeSegment(vo.getEmdCd(), 3, null);
        String li = normalizeSegment(vo.getLiCd(), 2, "00");

        String incoming = normalizeDigits(vo.getLdongCd());
        String candidate = null;
        if (sigungu != null && emd != null) {
            candidate = sigungu + emd + li;
        }

        if (incoming != null && incoming.length() == 10) {
            if (candidate != null && !incoming.equals(candidate)) {
                log.warn("⚠️ 전달된 ldongCd와 계산된 ldongCd가 불일치하여 계산값으로 대체합니다. 입력값: {}, 계산값: {}", incoming, candidate);
                return candidate;
            }
            return incoming;
        }

        if (candidate != null && candidate.length() == 10) {
            if (incoming != null && !incoming.isEmpty()) {
                log.warn("⚠️ 전달된 ldongCd가 10자리가 아니어서 재계산합니다. 입력값: {}, 재계산: {}", vo.getLdongCd(), candidate);
            }
            return candidate;
        }

        throw new IllegalArgumentException(String.format(
                "법정동코드를 10자리로 생성할 수 없습니다. 입력값(ldongCd=%s, sigunguCd=%s, emdCd=%s, liCd=%s)",
                vo.getLdongCd(), vo.getSigunguCd(), vo.getEmdCd(), vo.getLiCd()));
    }

    private void applyLdongCd(ParkingDetailVO vo) {
        String resolved = resolveLdongCd(vo);
        vo.setLdongCd(resolved);
        log.info("📌 저장 직전 코드 상태 - sidoCd={}, sigunguCd={}, emdCd={}, liCd={}, ldongCd={}",
                vo.getSidoCd(), vo.getSigunguCd(), vo.getEmdCd(), vo.getLiCd(), vo.getLdongCd());
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
            ensureOwnCd(vo);
            ensureAdminCodes(vo);
            applyBizPerIdentifiers(vo);
            ensureManageNoUnique(vo);
            // 🔥 STEP 0: prkPlceInfoSn 생성
            log.info("🔵 [STEP 0/4] prkPlceInfoSn 생성 시작");
            Integer newSn = prkDefPlceInfoMapper.generateParkingInfoSn(vo.getPrkPlceManageNo());
            vo.setPrkPlceInfoSn(newSn);

            if (vo.getPrkPlceInfoSn() == null || vo.getPrkPlceInfoSn() <= 0) {
                log.error("❌ prkPlceInfoSn이 생성되지 않았습니다: {}", vo.getPrkPlceInfoSn());
                throw new RuntimeException("주차장 일련번호 생성 실패");
            }
            log.info("✅ [STEP 0/4] prkPlceInfoSn 생성 완료: {}", newSn);

            applyLdongCd(vo);

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
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            timeout = 60,
            rollbackFor = Exception.class
    )
    public void insertOffstreetParking(ParkingDetailVO vo) {
        try {
            ensureOwnCd(vo);
            ensureAdminCodes(vo);
            applyBizPerIdentifiers(vo);
            ensureManageNoUnique(vo);
            // 🔥 STEP 0: prkPlceInfoSn 생성
            log.info("🔵 [노외주차장 STEP 0/4] prkPlceInfoSn 생성 시작");
            Integer newSn = prkDefPlceInfoMapper.generateParkingInfoSn(vo.getPrkPlceManageNo());
            vo.setPrkPlceInfoSn(newSn);

            if (vo.getPrkPlceInfoSn() == null || vo.getPrkPlceInfoSn() <= 0) {
                log.error("❌ prkPlceInfoSn이 생성되지 않았습니다: {}", vo.getPrkPlceInfoSn());
                throw new RuntimeException("주차장 일련번호 생성 실패");
            }
            log.info("✅ [STEP 0/4] prkPlceInfoSn 생성 완료: {}", newSn);

            applyLdongCd(vo);

            // 🔥 STEP 1: 기본 정보 INSERT
            log.info("🔵 [STEP 1/4] tb_prk_def_plce_info INSERT 시작");
            prkDefPlceInfoMapper.insertPrkDefPlceInfo(vo);
            log.info("✅ [STEP 1/4] tb_prk_def_plce_info INSERT 완료");

            // 🔥 STEP 2: 사업별 주차장 정보 INSERT
            log.info("🔵 [STEP 2/4] tb_biz_per_prklot_info INSERT 시작");
            prkDefPlceInfoMapper.insertBizPerPrklotInfo(vo);
            log.info("✅ [STEP 2/4] tb_biz_per_prklot_info INSERT 완료");

            // 🔥 STEP 3: 노외주차장 기본 정보 INSERT
            log.info("🔵 [STEP 3/4] tb_offstr_prklot_info INSERT 시작");
            prkDefPlceInfoMapper.insertOffstrPrklotInfo(vo);
            log.info("✅ [STEP 3/4] tb_offstr_prklot_info INSERT 완료");

            // 🔥 STEP 4: 노외주차장 운영 정보 INSERT
            log.info("🔵 [STEP 4/4] tb_offstr_prklot_oper_info INSERT 시작");
            prkDefPlceInfoMapper.insertOffstrPrklotOperInfo(vo);
            log.info("✅ [STEP 4/4] tb_offstr_prklot_oper_info INSERT 완료");

            log.info("🎉🎉🎉 노외주차장 4단계 INSERT 모두 성공");

        } catch (Exception e) {
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("❌❌❌ 노외주차장 INSERT 실패");
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("예외 타입: {}", e.getClass().getName());
            log.error("예외 메시지: {}", e.getMessage());
            log.error("상세 스택:", e);

            Throwable cause = e.getCause();
            while (cause != null) {
                log.error("  └─ Caused by: {} - {}", cause.getClass().getName(), cause.getMessage());
                cause = cause.getCause();
            }

            throw new RuntimeException("노외주차장 등록 실패: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void insertBuildParking(ParkingDetailVO vo) {
        try {
            ensureOwnCd(vo);
            ensureAdminCodes(vo);
            applyBizPerIdentifiers(vo);
            ensureManageNoUnique(vo);
            sanitizeAttachedOperLengths(vo);
            log.info("🆕 부설주차장 INSERT 시작 - 관리번호: {}", vo.getPrkPlceManageNo());

            // 🔵 STEP 0: prkPlceInfoSn 생성
            log.info("🔵 [부설주차장 STEP 0/4] prkPlceInfoSn 생성 시작");
            Integer newSn = prkDefPlceInfoMapper.generateParkingInfoSn(vo.getPrkPlceManageNo());
            vo.setPrkPlceInfoSn(newSn);

            if (vo.getPrkPlceInfoSn() == null || vo.getPrkPlceInfoSn() <= 0) {
                log.error("❌ prkPlceInfoSn이 생성되지 않았습니다: {}", vo.getPrkPlceInfoSn());
                throw new RuntimeException("주차장 일련번호 생성 실패");
            }
            log.info("✅ [STEP 0/4] prkPlceInfoSn 생성 완료: {}", newSn);

            applyLdongCd(vo);

            // 🔵 STEP 1: 기본 정보 INSERT (tb_prk_def_plce_info)
            log.info("🔵 [STEP 1/4] tb_prk_def_plce_info INSERT 시작");
            prkDefPlceInfoMapper.insertPrkDefPlceInfo(vo);
            log.info("✅ [STEP 1/4] tb_prk_def_plce_info INSERT 완료");

            // 🔵 STEP 2: 사업별 주차장 정보 INSERT (tb_biz_per_prklot_info)
            log.info("🔵 [STEP 2/4] tb_biz_per_prklot_info INSERT 시작");
            prkDefPlceInfoMapper.insertBizPerPrklotInfo(vo);
            log.info("✅ [STEP 2/4] tb_biz_per_prklot_info INSERT 완료");

            // 🔵 STEP 3: 부설주차장 기본 정보 INSERT (tb_atch_prklot_info)
            log.info("🔵 [STEP 3/4] tb_atch_prklot_info INSERT 시작");
            prkDefPlceInfoMapper.insertAtchPrklotInfo(vo);
            log.info("✅ [STEP 3/4] tb_atch_prklot_info INSERT 완료");

            // 🔵 STEP 4: 부설주차장 운영 정보 INSERT (tb_atch_prklot_oper_info)
            log.info("🔵 [STEP 4/4] tb_atch_prklot_oper_info INSERT 시작");
            prkDefPlceInfoMapper.insertAtchPrklotOperInfo(vo);
            log.info("✅ [STEP 4/4] tb_atch_prklot_oper_info INSERT 완료");

            log.info("🎉🎉🎉 부설주차장 4단계 INSERT 모두 성공 - prkPlceManageNo={}, prkPlceInfoSn={}",
                    vo.getPrkPlceManageNo(), vo.getPrkPlceInfoSn());

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
            ensureOwnCd(parkingData);
            ensureAdminCodes(parkingData);
            log.info("🔄 노상주차장 UPDATE: {}", parkingData.getPrkPlceManageNo());
            applyLdongCd(parkingData);

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
            ensureOwnCd(parkingData);
            ensureAdminCodes(parkingData);
            sanitizeOffstreetOperLengths(parkingData);
            log.info("🔄 노외주차장 UPDATE: {}", parkingData.getPrkPlceManageNo());
            applyLdongCd(parkingData);

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
            ensureOwnCd(parkingData);
            ensureAdminCodes(parkingData);
            sanitizeAttachedOperLengths(parkingData);
            log.info("🔄 부설주차장 UPDATE: {}", parkingData.getPrkPlceManageNo());
            applyLdongCd(parkingData);

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

    private void sanitizeOffstreetOperLengths(ParkingDetailVO vo) {
        // 좌표/시간 등 길이 제한 필드 방어 (DB는 varchar(11) 등)
        vo.setPrklotEntrLat(clean(vo.getPrklotEntrLat(), 11));
        vo.setPrklotEntrLon(clean(vo.getPrklotEntrLon(), 11));
        vo.setWkPeakStrTm(clean(vo.getWkPeakStrTm(), 11));
        vo.setWkPeakEndTm(clean(vo.getWkPeakEndTm(), 11));
        vo.setNtPeakStrTm(clean(vo.getNtPeakStrTm(), 11));
        vo.setNtPeakEndTm(clean(vo.getNtPeakEndTm(), 11));
        vo.setWkFeePayMthdOthr(clean(vo.getWkFeePayMthdOthr(), 11));
        vo.setNtFeePayMthdOthr(clean(vo.getNtFeePayMthdOthr(), 11));
        vo.setWkFeeMthdCd(normalizeCodeList(vo.getWkFeeMthdCd(), 11));
        vo.setNtFeeMthdCd(normalizeCodeList(vo.getNtFeeMthdCd(), 11));
        vo.setWkFeeStlmtMthdCd(normalizeCodeList(vo.getWkFeeStlmtMthdCd(), 11));
        vo.setNtFeeStlmtMthdCd(normalizeCodeList(vo.getNtFeeStlmtMthdCd(), 11));
        vo.setPrklotSignYn(clean(vo.getPrklotSignYn(), 1));
        vo.setTcktMchnYn(clean(vo.getTcktMchnYn(), 1));
        vo.setBarrGteYn(clean(vo.getBarrGteYn(), 1));
        vo.setExitAlrmYn(clean(vo.getExitAlrmYn(), 1));
        vo.setVehRcgnTpCd(clean(vo.getVehRcgnTpCd(), 11));
        vo.setBldg2fPrklotCd(clean(vo.getBldg2fPrklotCd(), 11));
        vo.setFallPrevFcltyYn(clean(vo.getFallPrevFcltyYn(), 1));
        vo.setSlpYn(clean(vo.getSlpYn(), 1));
        vo.setAntislpFcltyYn(clean(vo.getAntislpFcltyYn(), 1));
        vo.setSlpCtnGuidSignYn(clean(vo.getSlpCtnGuidSignYn(), 1));
    }

    private void sanitizeAttachedOperLengths(ParkingDetailVO vo) {
        vo.setMechPrklotTpCd(clean(vo.getMechPrklotTpCd(), 2));
        vo.setMechPrklotOperYn(clean(vo.getMechPrklotOperYn(), 2));
        vo.setWkdyOperTmCd(clean(vo.getWkdyOperTmCd(), 2));
        vo.setWkdyTmbasOperStrTm(clean(vo.getWkdyTmbasOperStrTm(), 4));
        vo.setWkdyTmbasOperEndTm(clean(vo.getWkdyTmbasOperEndTm(), 4));
        vo.setSatOperTmCd(clean(vo.getSatOperTmCd(), 2));
        vo.setSatTmbasOperStrTm(clean(vo.getSatTmbasOperStrTm(), 4));
        vo.setSatTmbasOperEndTm(clean(vo.getSatTmbasOperEndTm(), 4));
        vo.setHldyOperTmCd(clean(vo.getHldyOperTmCd(), 2));
        vo.setHldyTmbasOperStrTm(clean(vo.getHldyTmbasOperStrTm(), 4));
        vo.setHldyTmbasOperEndTm(clean(vo.getHldyTmbasOperEndTm(), 4));
        vo.setFeeImpsCd(clean(vo.getFeeImpsCd(), 2));
        vo.setFeePayMthdCd(clean(vo.getFeePayMthdCd(), 11));
        vo.setFeeSetlMthdCd(clean(vo.getFeeSetlMthdCd(), 5));
        vo.setFeePayMthdOthr(clean(vo.getFeePayMthdOthr(), 100));
        vo.setPrklotSignCd(clean(vo.getPrklotSignCd(), 1));
        vo.setTcktMchnYn(clean(vo.getTcktMchnYn(), 1));
        vo.setBarrGteYn(clean(vo.getBarrGteYn(), 1));
        vo.setExitAlrmYn(clean(vo.getExitAlrmYn(), 1));
        vo.setVehRcgnTpCd(clean(vo.getVehRcgnTpCd(), 2));
        vo.setWkPeakStrTm(clean(vo.getWkPeakStrTm(), 2));
        vo.setWkPeakEndTm(clean(vo.getWkPeakEndTm(), 2));
        vo.setNtPeakStrTm(clean(vo.getNtPeakStrTm(), 2));
        vo.setNtPeakEndTm(clean(vo.getNtPeakEndTm(), 2));
        vo.setPblOpenYn(clean(vo.getPblOpenYn(), 1));
        vo.setPrklotInfoPrvsnCnstYn(clean(vo.getPrklotInfoPrvsnCnstYn(), 1));
        vo.setBldg2fPrklotCd(clean(vo.getBldg2fPrklotCd(), 2));
        vo.setFallPrevFcltyYn(clean(vo.getFallPrevFcltyYn(), 1));
        vo.setSlpYn(clean(vo.getSlpYn(), 1));
        vo.setAntislpFcltyYn(clean(vo.getAntislpFcltyYn(), 1));
        vo.setSlpCtnGuidSignYn(clean(vo.getSlpCtnGuidSignYn(), 1));
        vo.setGuidDocYn(clean(vo.getGuidDocYn(), 1));
        vo.setSafeInspYn(clean(vo.getSafeInspYn(), 1));
        vo.setMgrYn(clean(vo.getMgrYn(), 1));
        vo.setAdmYn(clean(vo.getAdmYn(), 1));
        vo.setPrklotEntrLat(clean(vo.getPrklotEntrLat(), 30));
        vo.setPrklotEntrLon(clean(vo.getPrklotEntrLon(), 30));
    }

    // ========== 상태 변경 ==========
    @Override
    @Transactional
    public int updateSelectedStatusToPending(List<Map<String, Object>> parkingList) {
        if (parkingList == null || parkingList.isEmpty()) {
            return 0;
        }

        try {
            log.info("🔄 {}개 주차장 상태 변경 → 승인 대기", parkingList.size());

            Map<String, Object> params = new HashMap<>();
            params.put("parkingList", parkingList);

            int count = prkDefPlceInfoMapper.updateStatusToPending(params);
            log.info("✅ 상태 변경 완료: {}건", count);
            return count;
        } catch (Exception e) {
            log.error("❌ 상태 변경 실패", e);
            throw new RuntimeException("상태 변경 실패", e);
        }
    }
}
