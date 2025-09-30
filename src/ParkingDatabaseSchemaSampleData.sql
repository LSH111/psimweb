-- SQLINES LICENSE FOR EVALUATION USE ONLY
-- Paste this content into a 'dummy_data.sql' file and execute it in your database client.
-- This script generates sample data for various tables in the 'postgres.cpk' schema.

-- Data for: tb_co_user
INSERT INTO tb_co_user (user_id, user_cd, user_nm, user_ty_code, ency_de, retire_de, user_sttus_code, photo_unified_id, sign_unified_id, dept_cd, pstn_cd, clss_cd, rsp_cd, user_pw, email, mbtlnum, ownhom_telno, cmpny_telno, rgsde, updde, user_order, duty, pstn_detail, sigungu_cd, area_cd, road_yn, offstreet_yn, attached_yn, rgst_id, reg_dt, rgst_ip_addr, updusr_id, updt_dt, updusr_ip_addr, pwd_change_dd, change_yn, cfrm_yn) VALUES
('admin', 'U000', '관리자', 'ADMIN', '20230101', NULL, 'P', NULL, NULL, '0000', '0000', '0000', '0000', 'dummy_password', 'admin@psim.com', '010-0000-0000', '02-111-1111', '02-111-1112', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '1', '시스템 총괄', '총괄 관리자', '11110', '11', 'Y', 'Y', 'Y', 'system', CURRENT_TIMESTAMP, '127.0.0.1', 'system', CURRENT_TIMESTAMP, '127.0.0.1', '20230101', 'N', 'Y'),
('user1', 'U001', '김주차', 'USER', '20230201', NULL, 'P', NULL, NULL, '1000', '1001', '1002', '1003', 'dummy_password', 'user1@psim.com', '010-1111-1111', '031-222-2222', '02-333-3333', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '2', '데이터 입력', '조사원', '11220', '12', 'Y', 'N', 'N', 'admin', CURRENT_TIMESTAMP, '192.168.0.1', 'admin', CURRENT_TIMESTAMP, '192.168.0.1', '20230201', 'N', 'Y');

-- Data for: tb_atch_prklot_info
INSERT INTO tb_atch_prklot_info (prk_plce_info_sn, prk_plce_manage_no, prk_type, tot_prk_cnt, disab_prk_cnt, compact_prk_cnt, eco_prk_cnt, pregnant_prk_cnt, prk_oper_mthd_cd, oper_mby_cd, mgr_org, mgr_org_tel_no, grad_area, subordn_opertn_cd, reg_dt, rgst_id, rgst_ip_addr, updt_dt, updusr_id, updusr_ip_addr) VALUES
(1, '11680-00001', 'A', 120, 5, 10, 8, 4, '01', '01', '강남구도시관리공단', '02-2176-0567', '1', '01', CURRENT_TIMESTAMP, 'admin', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', '127.0.0.1'),
(2, '11110-00002', 'A', 75, 3, 5, 5, 2, '02', '02', '종로구시설관리공단', '02-2236-0052', '2', '02', CURRENT_TIMESTAMP, 'admin', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', '127.0.0.1');

-- Data for: tb_atch_prklot_oper_info
INSERT INTO tb_atch_prklot_oper_info (prk_plce_info_sn, prk_plce_manage_no, mech_prklot_tp_cd, mech_prklot_oper_yn, prk_inop_cnt, prk_fclty_tp_tot_capa, indr_self_tot_space_cnt, indr_self_flr_cnt, indr_self_deck_cnt, indr_mech_tot_space_cnt, indr_mech_flr_cnt, indr_mech_deck_cnt, outdr_self_tot_space_cnt, outdr_self_flr_cnt, outdr_self_deck_cnt, outdr_mech_tot_space_cnt, outdr_mech_flr_cnt, outdr_mech_deck_cnt, wkdy_oper_tm_cd, wkdy_tmbas_oper_str_tm, wkdy_tmbas_oper_end_tm, sat_oper_tm_cd, sat_tmbas_oper_str_tm, sat_tmbas_oper_end_tm, hldy_oper_tm_cd, hldy_tmbas_oper_str_tm, hldy_tmbas_oper_end_tm, fee_imps_cd, fee_frst_30min_prc, fee_10min_prc, fee_1hr_prc, fee_day_prc, fee_mnth_pass_prc, fee_hfyr_pass_prc, fee_pay_mthd_cd, fee_pay_mthd_othr, fee_setl_mthd_cd, prklot_sign_cd, tckt_mchn_yn, barr_gte_yn, exit_alrm_yn, veh_rcgn_tp_cd, wk_peak_str_tm, wk_peak_end_tm, wk_prk_veh_cnt, nt_peak_str_tm, nt_peak_end_tm, nt_prk_veh_cnt, prklot_entr_lat, prklot_entr_lon, pbl_open_yn, prklot_info_prvsn_cnst_yn, bldg_2f_prklot_cd, fall_prev_fclty_yn, slp_yn, antislp_fclty_yn, slp_ctn_guid_sign_yn, spd_bump_qty, stop_line_qty, crswlk_qty, guid_doc_yn, safe_insp_yn, mgr_yn, spcl_note, reg_dt, rgst_id, rgst_ip_addr, updt_dt, updusr_id, updusr_ip_addr, adm_yn) VALUES
(1, '11680-00001', '01', 'Y', '0', 120, 100, 2, 2, 20, 1, 1, 0, 0, 0, 0, 0, 0, 'Y', 900, 1800, 'Y', 900, 1700, 'N', 0, 0, 'Y', 1000, 500, 3000, 20000, 150000, 800000, 'C', NULL, 'B', 'A', 'Y', 'Y', 'Y', 'L', 1100, 1400, 80, 1900, 2100, 50, '37.5172', '127.0473', 'Y', 'Y', 'A', 'Y', 'N', 'Y', 'Y', 4, 10, 2, 'Y', 'Y', 'Y', '강남역 인근', CURRENT_TIMESTAMP, 'admin', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', '127.0.0.1', 'Y');

-- Data for: tb_attch_pic_mng_info
INSERT INTO tb_attch_pic_mng_info (prk_plce_manage_no, prk_plce_info_sn, prk_plce_type, prk_oper_type, seq_no, ext_nm, file_path, file_nm, real_file_nm, reg_dt, rgst_id, rgst_ip_addr, updt_dt, updusr_id, updusr_ip_addr) VALUES
('11680-00001', 1, '01', '01', 1, 'jpg', '/uploads/prk/', 'pic_1_1.jpg', 'd7c7a526-1d12-4c6f-8a25-a4b5b8f2c0d5.jpg', CURRENT_TIMESTAMP, 'user1', '192.168.1.10', CURRENT_TIMESTAMP, 'user1', '192.168.1.10'),
('11680-00001', 1, '01', '01', 2, 'jpg', '/uploads/prk/', 'pic_1_2.jpg', 'e8b8b637-2e23-5d7g-9b36-b5c6c9g3d1e6.jpg', CURRENT_TIMESTAMP, 'user1', '192.168.1.10', CURRENT_TIMESTAMP, 'user1', '192.168.1.10');

-- Data for: tb_biz_per_prklot_info
INSERT INTO tb_biz_per_prklot_info (biz_per_prk_mng_no, prk_biz_mng_no, prk_plce_manage_no, prk_plce_info_sn, prgs_sts_cd, srvy_id, rejt_rsn, reg_dt, rgst_id, rgst_ip_addr, updt_dt, updusr_id, updusr_ip_addr) VALUES
('BIZ-00001', 'PRK-BIZ-2024-001', '11680-00001', 1, '03', 'user1', NULL, CURRENT_TIMESTAMP, 'admin', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', '127.0.0.1'),
('BIZ-00002', 'PRK-BIZ-2024-002', '11110-00002', 2, '02', 'user1', '사진 품질 미흡', CURRENT_TIMESTAMP, 'admin', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', '127.0.0.1');

-- Data for: tb_co_addr
INSERT INTO tb_co_addr (ldong_cd, sido_cd, sigungu_cd, emd_cd, li_cd, sido_nm, sigungu_nm, lgal_emd_nm, legalli_nm, mntn_yn, lnm_mnno, lnm_sbno, rn_cd, rn, undgrnd_yn, buld_mnno, buld_sbno, bild_regstr_buld_nm, detail_buld_nm, buld_manage_no, emd_sn, adstrd_cd, adstrd_nm, zip, post_sn, much_dlvr_offic_nm, change_resn_cd, ntfc_dd, bfchg_rdnmadr, signgu_buld_nm, aphus_yn, bsis_zone_no, dtadd_alwnc_yn, rmn1, rmn2) VALUES
('1168010100', '11', '680', '10100', '00', '서울특별시', '강남구', '역삼동', '', 'N', 736, 7, '116804166793', '테헤란로7길', 'N', 22, 0, '한국동지앙빌딩', '', '1168010100107360007022834', '00', '1168051000', '역삼1동', '06134', '000', '', '00', '20240101', '', '한국동지앙빌딩', 'N', '06134', 'N', NULL, NULL),
('1111010100', '11', '110', '10100', '00', '서울특별시', '종로구', '청운동', '', 'N', 1, 0, '111103100002', '자하문로33길', 'N', 1, 0, '청운효자동주민센터', '', '1111010100100010000030589', '00', '1111051500', '청운효자동', '03046', '000', '', '00', '20240101', '', '청운효자동주민센터', 'N', '03046', 'N', NULL, NULL);

-- Data for: tb_co_auth
INSERT INTO tb_co_auth (auth_cd, auth_nm, auth_desc, use_yn, create_dt, menu_type, input_type) VALUES
('ROLE_ADMIN', '관리자', '시스템 전체 관리 권한', 'Y', '2023-01-01 00:00:00', 'A', 'SYSTEM'),
('ROLE_USER', '일반사용자', '데이터 조회 및 입력 권한', 'Y', '2023-01-01 00:00:00', 'U', 'USER');

-- Data for: tb_co_menu
INSERT INTO tb_co_menu (menu_cd, menu_nm, menu_level, prnt_menu_cd, menu_type, menu_desc, menu_path, menu_link, menu_img, menu_sort, use_yn, menu_param, menu_cont) VALUES
('M0000', '시스템관리', 1, 'ROOT', 'A', '관리자 메뉴', '/system', '/system/main', NULL, 1, 'Y', NULL, '시스템 관리 최상위 메뉴'),
('M1000', '주차장관리', 1, 'ROOT', 'U', '주차장 정보 관리', '/parking', '/parking/list', NULL, 2, 'Y', NULL, '주차장 정보 관리 최상위 메뉴');

-- Data for: tb_co_auth_menu
INSERT INTO tb_co_auth_menu (auth_cd, menu_cd, auth_menu, auth_read, auth_write, auth_excel, auth_print, auth_data) VALUES
('ROLE_ADMIN', 'M0000', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'),
('ROLE_ADMIN', 'M1000', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'),
('ROLE_USER', 'M1000', 'Y', 'Y', 'N', 'N', 'N', 'N');

-- Data for: tb_co_code_group
INSERT INTO tb_co_code_group (group_id, group_type, group_cd, group_nm, group_cont, del_yn, rgsde, register, updde, updusr) VALUES
('GRP001', 'SYSTEM', 'PRK_TYPE', '주차장 유형', '주차장 유형 코드', 'N', CURRENT_TIMESTAMP, 'admin', CURRENT_TIMESTAMP, 'admin');

-- Data for: tb_co_code
INSERT INTO tb_co_code (code_id, code_cd, code_nm, code_cont, sort_order, use_yn, group_cd, param1, param2, param3, param4, param5, del_yn, rgsde, register, updde, updusr) VALUES
('CODE001', '01', '노상주차장', '도로의 노면 또는 교통광장(교차점광장은 제외한다)의 일정한 구역에 설치된 주차장', 1, 'Y', 'PRK_TYPE', NULL, NULL, NULL, NULL, NULL, 'N', CURRENT_TIMESTAMP, 'admin', CURRENT_TIMESTAMP, 'admin'),
('CODE002', '02', '노외주차장', '도로의 노면 및 교통광장 외의 장소에 설치된 주차장', 2, 'Y', 'PRK_TYPE', NULL, NULL, NULL, NULL, NULL, 'N', CURRENT_TIMESTAMP, 'admin', CURRENT_TIMESTAMP, 'admin');

-- Data for: tb_offstr_prklot_info
INSERT INTO tb_offstr_prklot_info (prk_plce_info_sn, prk_plce_manage_no, prk_type, tot_prk_cnt, disab_prk_cnt, compact_prk_cnt, eco_prk_cnt, pregnant_prk_cnt, prk_oper_mthd_cd, oper_mby_cd, mgr_org, mgr_org_tel_no, grad_area, subordn_opertn_cd, reg_dt, rgst_id, rgst_ip_addr, updt_dt, updusr_id, updusr_ip_addr) VALUES
(3, '26440-00001', '02', 200, 10, 20, 15, 8, '01', '01', '부산시설공단', '051-860-7600', '1', '01', CURRENT_TIMESTAMP, 'admin', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', '127.0.0.1');

-- Data for: tb_prk_srvy_biz_info
INSERT INTO tb_prk_srvy_biz_info (prk_biz_mng_no, biz_yr, sigungu_cd, biz_nm, biz_cont, biz_str_dt, biz_end_dt, prk_type, reg_dt, rgst_id, rgst_ip_addr, updt_dt, updusr_id, updusr_ip_addr) VALUES
('PRK-BIZ-2024-001', '2024', '11680', '2024년 강남구 주차장 실태조사', '강남구 내 부설주차장 전수조사', '2024-03-01', '2024-11-30', 'A', CURRENT_TIMESTAMP, 'admin', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', '127.0.0.1'),
('PRK-BIZ-2024-002', '2024', '11110', '2024년 종로구 주차장 실태조사', '종로구 내 노상/노외주차장 실태조사', '2024-04-01', '2024-10-31', 'B', CURRENT_TIMESTAMP, 'admin', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', '127.0.0.1');

-- Data for: tb_prk_def_plce_info
INSERT INTO tb_prk_def_plce_info (prk_plce_manage_no, sigungu_cd, prk_plce_nm, prk_plce_road_addr, prk_plce_jibun_addr, prk_plce_lat, prk_plce_lon, prk_plce_tel_no, prk_plce_oper_info, prk_plce_add_info, reg_dt, rgst_id, rgst_ip_addr, updt_dt, updusr_id, updusr_ip_addr) VALUES
('11680-DEF-001', '11680', '강남구청 부설주차장', '서울특별시 강남구 학동로 426', '서울특별시 강남구 삼성동 16-1', '37.517552', '127.047437', '02-3423-5114', '평일 09:00~18:00', '최초 30분 무료', CURRENT_TIMESTAMP, 'admin', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', '127.0.0.1'),
('11110-DEF-001', '11110', '세종문화회관 주차장', '서울특별시 종로구 세종대로 175', '서울특별시 종로구 세종로 81-3', '37.572453', '126.976663', '02-399-1114', '24시간 연중무휴', '공연 관람 시 할인', CURRENT_TIMESTAMP, 'admin', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', '127.0.0.1');

-- End of script
