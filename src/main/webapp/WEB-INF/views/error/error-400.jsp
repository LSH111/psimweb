<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>잘못된 요청입니다</title>
</head>
<body>
<div class="error-container">
    <h1>잘못된 요청입니다 (400)</h1>
    <p>요청 내용이 올바르지 않습니다. 입력값을 확인 후 다시 시도해주세요.</p>
    <c:if test="${not empty requestScope['javax.servlet.error.message']}">
        <p class="error-detail">${requestScope['javax.servlet.error.message']}</p>
    </c:if>
    <a href="<c:url value='/index'/>" class="btn-home">메인으로 돌아가기</a>
</div>
</body>
</html>
