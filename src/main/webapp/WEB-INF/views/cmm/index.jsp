<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>주차장 관리 시스템</title>
    <link rel="stylesheet" href="<c:url value='/static/css/base.css'/>">
    <link rel="stylesheet" href="<c:url value='/static/css/layout.css'/>">
    <style>
        /* Add some basic styling for the dashboard */
        .dashboard {
            display: flex;
            gap: 20px;
            margin-top: 20px;
        }
        .status-card {
            border: 1px solid #ccc;
            padding: 20px;
            border-radius: 5px;
            width: 300px;
            background-color: #fff;
        }
        .status-card h3 {
            margin-top: 0;
        }
        .status-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <jsp:include page="/WEB-INF/views/fragments/header.jsp"/>
    <main class="main container">
        <h2>현황</h2>

        <div class="dashboard">
            <div class="status-card">
                <h3>주차장 현황</h3>
                <div class="status-item">
                    <span>작성중</span>
                    <strong>${parkingStatus.writing_count} 건</strong>
                </div>
                <div class="status-item">
                    <span>작성완료</span>
                    <strong>${parkingStatus.completed_count} 건</strong>
                </div>
                <div class="status-item">
                    <span>담당자 할당</span>
                    <strong>${parkingStatus.assigned_count} 건</strong>
                </div>
            </div>

            <%--<div class="status-card">
                <h3>이용상태 현황</h3>
                <div class="status-item">
                    <span>적법</span>
                    <strong>${usageStatus.legal_count} 건</strong>
                </div>
                <div class="status-item">
                    <span>불법</span>
                    <strong>${usageStatus.illegal_count} 건</strong>
                </div>
            </div>--%>
        </div>
    </main>

<script>
(function(){
  var btn = document.querySelector('.nav-toggle');
  var nav = document.querySelector('header nav');
  if(btn && nav){
    btn.addEventListener('click', function(){
      var opened = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }
})();
</script>
</body>
</html>
