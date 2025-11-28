-- 테스트 계정 seed (존재하면 덮어쓰지 않음)
INSERT INTO tb_co_user(user_id, user_pw, user_nm, sigungu_cd, sido_cd)
SELECT 'roadmap999',
       '123456789',
       '테스트유저',
       '00',
       '00'
WHERE NOT EXISTS (SELECT 1 FROM tb_co_user WHERE user_id = 'roadmap999');
