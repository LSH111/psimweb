<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>오류가 발생했습니다</title>
</head>
<body>
<div class="error-container">
    <h1>오류가 발생했습니다</h1>
    <p>서비스 이용 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
    <c:if test="${not empty status}">
        <p>HTTP 상태 코드: ${status}</p>
    </c:if>
    <c:if test="${not empty requestScope['javax.servlet.error.message']}">
        <p class="error-detail">${requestScope['javax.servlet.error.message']}</p>
    </c:if>
    <c:if test="${not empty message}">
        <p class="error-detail">${message}</p>
    </c:if>
    <a href="<c:url value='/index'/>" class="btn-home">메인으로 돌아가기</a>
</div>
</body>
</html>
