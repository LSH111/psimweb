package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.PrkDefPlceInfoMapper;
import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrkDefPlceInfoServiceImpl implements PrkDefPlceInfoService {

    private final PrkDefPlceInfoMapper prkDefPlceInfoMapper;

    @Override
    public List<ParkingListVO> getParkingList(Map<String, Object> params) {
        try {
            log.info("주차장 목록 조회 시작 - 파라미터: {}", params);
            List<ParkingListVO> result = prkDefPlceInfoMapper.selectParkingList(params);
            log.info("주차장 목록 조회 완료 - 결과 개수: {}", result.size());
            return result;
        } catch (Exception e) {
            log.error("주차장 목록 조회 실패 - 파라미터: {}", params, e);
            return Collections.emptyList();
        }
    }

    @Override
    public int getParkingListCount(Map<String, Object> params) {
        try {
            log.info("주차장 목록 개수 조회 시작 - 파라미터: {}", params);
            int count = prkDefPlceInfoMapper.selectParkingListCount(params);
            log.info("주차장 목록 개수 조회 완료 - 결과: {}", count);
            return count;
        } catch (Exception e) {
            log.error("주차장 목록 개수 조회 실패 - 파라미터: {}", params, e);
            return 0;
        }
    }

    @Override
    public ParkingListVO getParkingDetail(String manageNo, Integer infoSn) {
        try {
            log.info("주차장 상세 조회 - manageNo: {}, infoSn: {}", manageNo, infoSn);
            Map<String, Object> params = new HashMap<>();
            params.put("prkPlceManageNo", manageNo);
            params.put("prkPlceInfoSn", infoSn);
            return prkDefPlceInfoMapper.selectParkingDetail(params);
        } catch (Exception e) {
            log.error("주차장 상세 조회 실패 - manageNo: {}, infoSn: {}", manageNo, infoSn, e);
            return null;
        }
    }

    @Override
    @Cacheable(value = "parkingDetail", key = "#prkPlceManageNo", unless = "#result == null")
    public ParkingDetailVO getOnstreetParkingDetail(String prkPlceManageNo) {
        try {
            log.info("노상주차장 상세 조회 - prkPlceManageNo: {}", prkPlceManageNo);
            ParkingDetailVO detail = prkDefPlceInfoMapper.selectOnstreetParkingDetail(prkPlceManageNo);

            if (detail == null) {
                log.warn("노상주차장 상세 정보를 찾을 수 없습니다 - prkPlceManageNo: {}", prkPlceManageNo);
            } else {
                log.info("노상주차장 상세 조회 완료 - 주차장명: {}", detail.getPrkplceNm());
            }

            return detail;
        } catch (Exception e) {
            log.error("노상주차장 상세 조회 실패 - prkPlceManageNo: {}", prkPlceManageNo, e);
            return null;
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "parkingDetail", key = "#parkingData.prkPlceManageNo")
    public void updateOnstreetParking(ParkingDetailVO parkingData) {
        try {
            log.info("노상주차장 정보 업데이트 시작 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());

            // 1. 기본 정보 업데이트 (tb_prk_def_plce_info)
            prkDefPlceInfoMapper.updatePrkDefPlceInfo(parkingData);
            log.info("✅ 기본 정보 업데이트 완료");

            // 2. 노상주차장 정보 업데이트 (tb_onstr_prklot_info)
            prkDefPlceInfoMapper.updateOnstrPrklotInfo(parkingData);
            log.info("✅ 노상주차장 정보 업데이트 완료");

            // 3. 운영 정보 업데이트 (tb_onstr_prklot_oper_info)
            prkDefPlceInfoMapper.updateOnstrPrklotOperInfo(parkingData);
            log.info("✅ 운영 정보 업데이트 완료");

            // 4. 🔥 진행상태 업데이트 (prgs_sts_cd = '10')
            prkDefPlceInfoMapper.updateBizPerPrklotPrgsSts(parkingData);
            log.info("✅ 진행상태 업데이트 완료");

            log.info("노상주차장 정보 업데이트 완료 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());
        } catch (Exception e) {
            log.error("노상주차장 정보 업데이트 실패 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo(), e);
            throw new RuntimeException("주차장 정보 업데이트 중 오류가 발생했습니다.", e);
        }
    }

    // 🔥 노외주차장 상세 조회
    @Override
    @Cacheable(value = "parkingDetail", key = "#prkPlceManageNo", unless = "#result == null")
    public ParkingDetailVO getOffstreetParkingDetail(String prkPlceManageNo) {
        try {
            log.info("노외주차장 상세 조회 - prkPlceManageNo: {}", prkPlceManageNo);
            ParkingDetailVO detail = prkDefPlceInfoMapper.selectOffstreetParkingDetail(prkPlceManageNo);

            if (detail == null) {
                log.warn("노외주차장 상세 정보를 찾을 수 없습니다 - prkPlceManageNo: {}", prkPlceManageNo);
            } else {
                log.info("노외주차장 상세 조회 완료 - 주차장명: {}", detail.getPrkplceNm());
            }

            return detail;
        } catch (Exception e) {
            log.error("노외주차장 상세 조회 실패 - prkPlceManageNo: {}", prkPlceManageNo, e);
            return null;
        }
    }

    // 🔥 노외주차장 업데이트
    @Override
    @Transactional
    @CacheEvict(value = "parkingDetail", key = "#parkingData.prkPlceManageNo")
    public void updateOffstreetParking(ParkingDetailVO parkingData) {
        try {
            log.info("노외주차장 정보 업데이트 시작 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());

            // 1. 기본 정보 업데이트 (tb_prk_def_plce_info)
            prkDefPlceInfoMapper.updatePrkDefPlceInfo(parkingData);

            // 2. 노외주차장 정보 업데이트 (tb_offstr_prklot_info)
            prkDefPlceInfoMapper.updateOffstrPrklotInfo(parkingData);

            // 3. 운영 정보 업데이트 (tb_offstr_prklot_oper_info) ✅ 노외 전용 필드 포함
            prkDefPlceInfoMapper.updateOffstrPrklotOperInfo(parkingData);

            // 4. 진행상태 업데이트 (prgs_sts_cd = '10')
            prkDefPlceInfoMapper.updateBizPerPrklotPrgsSts(parkingData);

            log.info("노외주차장 정보 업데이트 완료 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());
        } catch (Exception e) {
            log.error("노외주차장 정보 업데이트 실패 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo(), e);
            throw new RuntimeException("주차장 정보 업데이트 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    @Transactional
    public void updateParkingStatus(List<String> manageNos, String newStatus) {
        try {
            log.info("주차장 상태 일괄 업데이트 시작 - 대상: {}건, 상태: {}", manageNos.size(), newStatus);

            for (String manageNo : manageNos) {
                Map<String, Object> params = new HashMap<>();
                params.put("prkPlceManageNo", manageNo);
                params.put("newStatus", newStatus);
                prkDefPlceInfoMapper.updateParkingStatus(params);
            }

            log.info("주차장 상태 일괄 업데이트 완료 - 업데이트된 건수: {}", manageNos.size());
        } catch (Exception e) {
            log.error("주차장 상태 업데이트 실패", e);
            throw new RuntimeException("주차장 상태 업데이트 중 오류가 발생했습니다.", e);
        }
    }

    // 🔥 부설주차장 상세 조회
    @Override
    @Cacheable(value = "parkingDetail", key = "#prkPlceManageNo", unless = "#result == null")
    public ParkingDetailVO getBuildParkingDetail(String prkPlceManageNo) {
        try {
            log.info("부설주차장 상세 조회 - prkPlceManageNo: {}", prkPlceManageNo);
            ParkingDetailVO detail = prkDefPlceInfoMapper.selectBuildParkingDetail(prkPlceManageNo);

            if (detail == null) {
                log.warn("부설주차장 상세 정보를 찾을 수 없습니다 - prkPlceManageNo: {}", prkPlceManageNo);
            } else {
                log.info("부설주차장 상세 조회 완료 - 주차장명: {}", detail.getPrkplceNm());
            }

            return detail;
        } catch (Exception e) {
            log.error("부설주차장 상세 조회 실패 - prkPlceManageNo: {}", prkPlceManageNo, e);
            return null;
        }
    }

    // 🔥 부설주차장 업데이트
    @Override
    @Transactional
    @CacheEvict(value = "parkingDetail", key = "#parkingData.prkPlceManageNo")
    public void updateBuildParking(ParkingDetailVO parkingData) {
        try {
            log.info("부설주차장 정보 업데이트 시작 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());

            // 1. 기본 정보 업데이트 (tb_prk_def_plce_info)
            prkDefPlceInfoMapper.updatePrkDefPlceInfo(parkingData);
            log.info("✅ 기본 정보 업데이트 완료");

            // 2. 부설주차장 정보 업데이트 (tb_atch_prklot_info)
            prkDefPlceInfoMapper.updateAtchPrklotInfo(parkingData);
            log.info("✅ 부설주차장 정보 업데이트 완료");

            // 3. 부설주차장 운영 정보 업데이트 (tb_atch_prklot_oper_info)
            prkDefPlceInfoMapper.updateAtchPrklotOperInfo(parkingData);
            log.info("✅ 부설주차장 운영 정보 업데이트 완료");

            // 4. 진행상태 업데이트 (prgs_sts_cd = '10')
            prkDefPlceInfoMapper.updateBizPerPrklotPrgsSts(parkingData);
            log.info("✅ 진행상태 업데이트 완료");

            log.info("부설주차장 정보 업데이트 완료 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());
        } catch (Exception e) {
            log.error("부설주차장 정보 업데이트 실패 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo(), e);
            throw new RuntimeException("주차장 정보 업데이트 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    @Transactional
    public void updateSelectedParkings(List<ParkingListVO> parkingList) {
        try {
            log.info("선택된 주차장 정보 일괄 업데이트 시작 - 대상: {}건", parkingList.size());

            for (ParkingListVO parking : parkingList) {
                Map<String, Object> params = new HashMap<>();
                params.put("prkPlceManageNo", parking.getPrkPlceManageNo());
                params.put("prkPlceInfoSn", parking.getPrkPlceInfoSn());
                params.put("prgsStsCd", parking.getPrgsStsCd());
                // 필요한 다른 업데이트 필드들 추가

                prkDefPlceInfoMapper.updateSelectedParking(params);
            }

            log.info("선택된 주차장 정보 일괄 업데이트 완료");
        } catch (Exception e) {
            log.error("선택된 주차장 정보 업데이트 실패", e);
            throw new RuntimeException("주차장 정보 업데이트 중 오류가 발생했습니다.", e);
        }
    }

    // ========== 🔥 INSERT 메서드 구현 ==========

    /**
     * 주차장 저장 (신규/수정 자동 판별)
     */
    @Override
    @Transactional
    public String saveParking(ParkingDetailVO parkingData) {
        try {
            boolean isNew = parkingData.getPrkPlceManageNo() == null
                    || parkingData.getPrkPlceManageNo().trim().isEmpty();

            if (isNew) {
                log.info("신규 주차장 등록 - 유형: {}", parkingData.getPrkPlceType());

                String prkType = parkingData.getPrkPlceType();
                if ("노상".equals(prkType)) {
                    return insertOnstreetParking(parkingData);
                } else if ("노외".equals(prkType)) {
                    return insertOffstreetParking(parkingData);
                } else if ("부설".equals(prkType)) {
                    return insertBuildParking(parkingData);
                } else {
                    throw new IllegalArgumentException("유효하지 않은 주차장 유형: " + prkType);
                }
            } else {
                log.info("기존 주차장 수정 - {}", parkingData.getPrkPlceManageNo());

                String prkType = parkingData.getPrkPlceType();
                if ("노상".equals(prkType)) {
                    updateOnstreetParking(parkingData);
                } else if ("노외".equals(prkType)) {
                    updateOffstreetParking(parkingData);
                } else if ("부설".equals(prkType)) {
                    updateBuildParking(parkingData);
                }

                return parkingData.getPrkPlceManageNo();
            }
        } catch (Exception e) {
            log.error("주차장 저장 실패", e);
            throw new RuntimeException("주차장 정보 저장 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 노상주차장 신규 등록
     */
    @Override
    @Transactional
    public String insertOnstreetParking(ParkingDetailVO parkingData) {
        try {
            // 주차장관리번호 생성
            String prkPlceManageNo = generatePrkPlceManageNo();
            parkingData.setPrkPlceManageNo(prkPlceManageNo);
            parkingData.setPrkPlceInfoSn(1);

            log.info("노상주차장 등록 시작 - {}", prkPlceManageNo);

            // INSERT 실행
            prkDefPlceInfoMapper.insertPrkDefPlceInfo(parkingData);
            prkDefPlceInfoMapper.insertBizPerPrklotInfo(parkingData);
            prkDefPlceInfoMapper.insertOnstrPrklotInfo(parkingData);
            prkDefPlceInfoMapper.insertOnstrPrklotOperInfo(parkingData);

            log.info("✅ 노상주차장 등록 완료 - {}", prkPlceManageNo);
            return prkPlceManageNo;

        } catch (Exception e) {
            log.error("노상주차장 등록 실패", e);
            throw new RuntimeException("노상주차장 등록 중 오류: " + e.getMessage(), e);
        }
    }

    /**
     * 노외주차장 신규 등록
     */
    @Override
    @Transactional
    public String insertOffstreetParking(ParkingDetailVO parkingData) {
        try {
            String prkPlceManageNo = generatePrkPlceManageNo();
            parkingData.setPrkPlceManageNo(prkPlceManageNo);
            parkingData.setPrkPlceInfoSn(1);

            log.info("노외주차장 등록 시작 - {}", prkPlceManageNo);

            prkDefPlceInfoMapper.insertPrkDefPlceInfo(parkingData);
            prkDefPlceInfoMapper.insertBizPerPrklotInfo(parkingData);
            prkDefPlceInfoMapper.insertOffstrPrklotInfo(parkingData);
            prkDefPlceInfoMapper.insertOffstrPrklotOperInfo(parkingData);

            log.info("✅ 노외주차장 등록 완료 - {}", prkPlceManageNo);
            return prkPlceManageNo;

        } catch (Exception e) {
            log.error("노외주차장 등록 실패", e);
            throw new RuntimeException("노외주차장 등록 중 오류: " + e.getMessage(), e);
        }
    }

    /**
     * 부설주차장 신규 등록
     */
    @Override
    @Transactional
    public String insertBuildParking(ParkingDetailVO parkingData) {
        try {
            String prkPlceManageNo = generatePrkPlceManageNo();
            parkingData.setPrkPlceManageNo(prkPlceManageNo);
            parkingData.setPrkPlceInfoSn(1);

            log.info("부설주차장 등록 시작 - {}", prkPlceManageNo);

            prkDefPlceInfoMapper.insertPrkDefPlceInfo(parkingData);
            prkDefPlceInfoMapper.insertBizPerPrklotInfo(parkingData);
            prkDefPlceInfoMapper.insertAtchPrklotInfo(parkingData);
            prkDefPlceInfoMapper.insertAtchPrklotOperInfo(parkingData);

            log.info("✅ 부설주차장 등록 완료 - {}", prkPlceManageNo);
            return prkPlceManageNo;

        } catch (Exception e) {
            log.error("부설주차장 등록 실패", e);
            throw new RuntimeException("부설주차장 등록 중 오류: " + e.getMessage(), e);
        }
    }

    /**
     * 주차장관리번호 생성
     * 형식: PRK + YYYYMMDDHHMMSS + 랜덤3자리
     * 예: PRK20251031153045001
     */
    private String generatePrkPlceManageNo() {
        String timestamp = java.time.LocalDateTime.now().format(
                java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
        );
        String randomNum = String.format("%03d", (int)(Math.random() * 1000));
        return "PRK" + timestamp + randomNum;
    }

    @Override
    public List<ParkingListVO> getParkingListForMap(Map<String, Object> params) {
        return prkDefPlceInfoMapper.selectParkingListForMap(params);
    }
}