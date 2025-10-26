package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.PrkDefPlceInfoMapper;
import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.OnstreetParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    public OnstreetParkingDetailVO getOnstreetParkingDetail(String prkPlceManageNo) {
        try {
            log.info("노상주차장 상세 조회 - prkPlceManageNo: {}", prkPlceManageNo);
            OnstreetParkingDetailVO detail = prkDefPlceInfoMapper.selectOnstreetParkingDetail(prkPlceManageNo);

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
    public void updateOnstreetParking(OnstreetParkingDetailVO parkingData) {
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

            log.info("노상주차장 정보 업데이트 완료 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());
        } catch (Exception e) {
            log.error("노상주차장 정보 업데이트 실패 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo(), e);
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
}