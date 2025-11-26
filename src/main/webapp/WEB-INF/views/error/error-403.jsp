<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>접근이 거부되었습니다</title>
</head>
<body>
<div class="error-container">
    <h1>접근이 거부되었습니다 (403)</h1>
    <p>이 페이지에 접근할 권한이 없습니다. 권한이 필요한 경우 관리자에게 문의해주세요.</p>
    <c:if test="${not empty requestScope['javax.servlet.error.message']}">
        <p class="error-detail">${requestScope['javax.servlet.error.message']}</p>
    </c:if>
    <a href="<c:url value='/index'/>" class="btn-home">메인으로 돌아가기</a>
</div>
</body>
</html>
