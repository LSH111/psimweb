package com.psim.web.prk.controller;

import com.psim.web.cmm.vo.CoUserVO;
import com.psim.web.file.vo.AttchPicMngInfoVO;
import com.psim.web.file.service.AttchPicMngInfoService;
import com.psim.web.prk.service.PrkUsageStatusService;
import com.psim.web.prk.vo.PrkUsageStatusVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 주차이용실태관리 Controller
 */
@Slf4j
@Controller
@RequestMapping("/prk")
@RequiredArgsConstructor
public class PrkUsageStatusController {

    private final PrkUsageStatusService usageStatusService;
    private final AttchPicMngInfoService attchPicService;

    /**
     * 주차이용실태 목록 화면
     */
    @GetMapping("/usage-status-list")
    public String usageStatusList(HttpSession session, Model model) {
        // 세션에서 사용자 정보 가져오기
        CoUserVO loginUser = (CoUserVO) session.getAttribute("loginUser");
        @SuppressWarnings("unchecked")
        List<String> userBizList = (List<String>) session.getAttribute("userBizList");

        if (loginUser != null) {
            // 사업관리번호 (첫 번째 것 사용)
            String prkBizMngNo = (userBizList != null && !userBizList.isEmpty())
                    ? userBizList.get(0)
                    : null;

            // 모델에 세션 정보 추가
            model.addAttribute("prkBizMngNo", prkBizMngNo);
            model.addAttribute("sigunguCd", loginUser.getSigunguCd());
            model.addAttribute("sidoCd", loginUser.getSidoCd());
            model.addAttribute("userName", loginUser.getUserNm());
            model.addAttribute("userTel", loginUser.getMbtlnum());

            log.info("📋 세션 정보 전달 - prkBizMngNo: {}, sigunguCd: {}, sidoCd: {}, userName: {}, userTel: {}",
                    prkBizMngNo, loginUser.getSigunguCd(), loginUser.getSidoCd(),
                    loginUser.getUserNm(), loginUser.getMbtlnum());
        } else {
            log.warn("⚠️ 세션에 로그인 사용자 정보가 없습니다.");
        }

        return "prk/usage-status-list";
    }

    /**
     * 주차이용실태 목록 조회 API
     */
    @GetMapping("/api/usage-status/list")
    @ResponseBody
    public Map<String, Object> getUsageStatusList(PrkUsageStatusVO vo) {
        Map<String, Object> result = new HashMap<>();

        try {
            log.info("🔍 목록 조회 요청 - prkBizMngNo: {}, searchYear: {}, searchSido: {}, searchSigungu: {}, searchEmd: {}, searchVehicleNo: {}, searchLawCd: {}",
                    vo.getPrkBizMngNo(),
                    vo.getSearchYear(),
                    vo.getSearchSidoCode(),
                    vo.getSearchSigunguCode(),
                    vo.getSearchEmdCode(),
                    vo.getSearchVehicleNo(),
                    vo.getSearchLawCd());

            List<PrkUsageStatusVO> list = usageStatusService.getUsageStatusList(vo);

            log.info("✅ 목록 조회 결과: {}건", list != null ? list.size() : 0);
            if (list != null && !list.isEmpty()) {
                log.info("📋 첫 번째 데이터: {}", list.get(0));
            }

            result.put("success", true);
            result.put("list", list);
            result.put("totalCount", list != null ? list.size() : 0);
            result.put("page", vo.getPage());
            result.put("pageSize", vo.getPageSize());

        } catch (Exception e) {
            log.error("❌ 주차이용실태 목록 조회 오류", e);
            result.put("success", false);
            result.put("message", "목록 조회 중 오류가 발생했습니다.");
        }

        return result;
    }

    /**
     * 주차이용실태 상세 조회 API
     */
    @GetMapping("/api/usage-status/detail")
    @ResponseBody
    public Map<String, Object> getUsageStatusDetail(PrkUsageStatusVO vo) {
        Map<String, Object> result = new HashMap<>();

        try {
            PrkUsageStatusVO data = usageStatusService.getUsageStatusDetail(vo);

            result.put("success", true);
            result.put("data", data);

        } catch (Exception e) {
            log.error("주차이용실태 상세 조회 오류", e);
            result.put("success", false);
            result.put("message", "상세 조회 중 오류가 발생했습니다.");
        }

        return result;
    }

    /**
     * 🔥 이용실태 첨부파일 목록 조회 API
     */
    @GetMapping("/api/usage-status/files")
    @ResponseBody
    public Map<String, Object> getUsageStatusFiles(
            @RequestParam("cmplSn") String cmplSn
    ) {
        Map<String, Object> result = new HashMap<>();

        try {
            log.info("📂 첨부파일 목록 조회: cmplSn={}", cmplSn);

            List<AttchPicMngInfoVO> fileList = attchPicService.getAttchPicMngInfoListByCmplSn(cmplSn, "USG_PHOTO");

            result.put("success", true);
            result.put("files", fileList);
            result.put("count", fileList != null ? fileList.size() : 0);

        } catch (Exception e) {
            log.error("❌ 첨부파일 목록 조회 오류", e);
            result.put("success", false);
            result.put("message", "첨부파일 목록 조회 중 오류가 발생했습니다.");
        }

        return result;
    }

    /**
     * 주차이용실태 저장 API
     */
    @PostMapping("/api/usage-status/save")
    @ResponseBody
    public Map<String, Object> saveUsageStatus(
            @RequestParam Map<String, String> params,
            @RequestParam(value = "photos", required = false) List<MultipartFile> photos,
            HttpServletRequest request,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        try {
            CoUserVO loginUser = (CoUserVO) session.getAttribute("loginUser");
            if (loginUser == null) {
                result.put("success", false);
                result.put("message", "로그인 정보가 없습니다.");
                return result;
            }

            @SuppressWarnings("unchecked")
            List<String> userBizList = (List<String>) session.getAttribute("userBizList");
            if (userBizList == null || userBizList.isEmpty()) {
                result.put("success", false);
                result.put("message", "사업관리번호 정보가 없습니다.");
                return result;
            }

            // VO 생성
            PrkUsageStatusVO vo = new PrkUsageStatusVO();
            vo.setPrkBizMngNo(userBizList.get(0));
            vo.setEmdCd(params.get("emdCd"));
            vo.setExaminDd(params.get("examinDd"));
            vo.setExaminTimelge(params.get("examinTimelge"));
            vo.setVhctyCd(params.get("vhctyCd"));
            vo.setLawGbn(params.get("lawGbn"));
            vo.setLawCd(params.get("lawCd"));
            vo.setVhcleNo(params.get("vhcleNo"));
            vo.setSrvyId(params.get("srvyId"));
            vo.setSrvyTel(params.get("srvyTel"));
            vo.setRemark(params.get("remark"));
            vo.setPlceLat(params.get("plceLat"));
            vo.setPlceLon(params.get("plceLon"));
            vo.setRgstId(loginUser.getUserId());
            vo.setUpdusrId(loginUser.getUserId());
            vo.setRgstIpAddr(request.getRemoteAddr());
            vo.setUpdusrIpAddr(request.getRemoteAddr());

            log.info("💾 이용실태 저장 시작 - 차량번호: {}", vo.getVhcleNo());

            // 이용실태 저장 (cmpl_sn 자동 생성)
            int cnt = usageStatusService.insertUsageStatus(vo);

            if (cnt > 0) {
                String cmplSn = vo.getCmplSn();
                log.info("✅ 이용실태 저장 완료 - cmpl_sn: {}", cmplSn);

                // 파일 업로드 (cmplSn 사용)
                if (photos != null && !photos.isEmpty()) {
                    log.info("📸 파일 업로드 시작 - {}개", photos.size());

                    List<AttchPicMngInfoVO> uploadedFiles = attchPicService.uploadAndSaveFilesForUsage(
                            vo.getPrkBizMngNo(),
                            cmplSn,
                            "USG_PHOTO",
                            photos,
                            loginUser.getUserId(),
                            request.getRemoteAddr()
                    );

                    log.info("✅ 파일 업로드 완료: {}개", uploadedFiles.size());
                    result.put("uploadedFiles", uploadedFiles);
                }

                result.put("success", true);
                result.put("message", "저장되었습니다.");
                result.put("cmplSn", cmplSn);
            } else {
                result.put("success", false);
                result.put("message", "저장에 실패했습니다.");
            }

        } catch (Exception e) {
            log.error("❌ 저장 오류", e);
            result.put("success", false);
            result.put("message", "저장 중 오류가 발생했습니다: " + e.getMessage());
        }

        return result;
    }

    /**
     * 주차이용실태 삭제 API
     */
    @DeleteMapping("/api/usage-status/delete")
    @ResponseBody
    public Map<String, Object> deleteUsageStatus(PrkUsageStatusVO vo) {
        Map<String, Object> result = new HashMap<>();

        try {
            int cnt = usageStatusService.deleteUsageStatus(vo);

            result.put("success", cnt > 0);
            result.put("message", cnt > 0 ? "삭제되었습니다." : "삭제에 실패했습니다.");

        } catch (Exception e) {
            log.error("주차이용실태 삭제 오류", e);
            result.put("success", false);
            result.put("message", "삭제 중 오류가 발생했습니다.");
        }

        return result;
    }
}
