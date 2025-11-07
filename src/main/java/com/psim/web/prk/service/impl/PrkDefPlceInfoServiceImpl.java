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

    // ========== 신규 등록 ==========

    @Override
    public String generatePrkPlceManageNo() {
        try {
            String newManageNo = prkDefPlceInfoMapper.generateParkingManageNo();
            log.info("✅ 주차장관리번호 생성: {}", newManageNo);
            return newManageNo;
        } catch (Exception e) {
            log.error("❌ 주차장관리번호 생성 실패", e);
            throw new RuntimeException("주차장 관리번호 생성 실패", e);
        }
    }

    @Override
    @Transactional
    public void insertOnstreetParking(ParkingDetailVO vo) {
        try {
            log.info("🆕 노상주차장 INSERT 시작: {}", vo.getPrkPlceManageNo());
            // 🔥 4개의 INSERT를 순차적으로 실행 (하나의 트랜잭션)
            prkDefPlceInfoMapper.insertPrkDefPlceInfo(vo);
            log.info("  ✅ 1/4: tb_prk_def_plce_info INSERT 완료");
            prkDefPlceInfoMapper.insertBizPerPrklotInfo(vo);
            log.info("  ✅ 2/4: tb_biz_per_prklot_info INSERT 완료");
            prkDefPlceInfoMapper.insertOnstrPrklotInfo(vo);
            log.info("  ✅ 3/4: tb_onstr_prklot_info INSERT 완료");
            prkDefPlceInfoMapper.insertOnstrPrklotOperInfo(vo);
            log.info("  ✅ 4/4: tb_onstr_prklot_oper_info INSERT 완료");
            log.info("✅ 노상주차장 INSERT 완료 - 관리번호: {}", vo.getPrkPlceManageNo());
        } catch (Exception e) {
            log.error("❌ 노상주차장 INSERT 실패", e);
            throw new RuntimeException("노상주차장 등록 실패", e);
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
    @Transactional
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