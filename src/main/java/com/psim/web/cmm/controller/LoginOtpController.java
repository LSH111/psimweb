package com.psim.web.cmm.controller;

import com.psim.web.cmm.mapper.LoginMapper;
import com.psim.web.cmm.service.LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class LoginOtpController {

    private final LoginService loginService;
    private final LoginMapper loginMapper;

    @RequestMapping(
            value = {"/login/callCertify", "/spis/login/callCertify"},
            method = {RequestMethod.POST, RequestMethod.GET}
    )
    @ResponseBody
    public String callCertify(@RequestParam Map<String, Object> loginParam) throws Exception {
        ModelMap modelMap = new ModelMap();

        // ts_login.jsp는 login[phone] 형태로 전송하므로 키 정규화
        String rawPhone = val(loginParam, "login[phone]", val(loginParam, "phone", ""));
        Map<String, Object> login = new java.util.HashMap<>();
        login.put("phone", rawPhone);
        modelMap.addAttribute("login", login);

        // 휴대폰 번호로 사용자 조회하여 checkTelLogin 세팅 (없으면 null 그대로)
        if (!rawPhone.isEmpty()) {
            Map<String, Object> found = loginMapper.selectUserByPhone(rawPhone);
            if (found != null) {
                modelMap.addAttribute("checkTelLogin", new ModelMap(found));
            }
        }

        return loginService.callCertify(modelMap);
    }

    @PostMapping("/login/checkCertify")
    @ResponseBody
    public String checkCertify(@RequestParam Map<String, Object> loginParam) throws Exception {
        ModelMap modelMap = new ModelMap();
        // ts_login.jsp는 login[tel], login[certify] 형태로 전송
        String tel = val(loginParam, "login[tel]", val(loginParam, "tel", ""));
        String certify = val(loginParam, "login[certify]", val(loginParam, "certify", ""));
        Map<String, Object> login = new java.util.HashMap<>();
        login.put("tel", tel);
        login.put("certify", certify);
        modelMap.addAttribute("login", login);
        return loginService.checkCertify(modelMap);
    }

    private String val(Map<String, Object> m, String key, String defVal) {
        Object v = m.get(key);
        return v == null ? defVal : v.toString();
    }
}
