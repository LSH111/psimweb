<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>주차장 관리 시스템</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/base.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/layout.css">
    <style>
        /* Add some basic styling for the dashboard */
        .dashboard {
            display: flex;
            gap: 20px;
            margin-top: 30px;
            justify-content: center;
        }
        
        .status-panel {
            background-color: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 0;
            width: 300px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .panel-header {
            background-color: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e0e0e0;
            border-radius: 8px 8px 0 0;
        }
        
        .panel-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin: 0;
            text-align: center;
        }
        
        .panel-body {
            padding: 20px;
        }
        
        .status-grid {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .status-item {
            text-align: center;
            flex: 1;
        }
        
        .status-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
        }
        
        .status-count {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        
        .status-count.seoul {
            color: #dc3545;
        }
        
        .status-count.gangwon {
            color: #007bff;
        }
        
        .status-count.illegal {
            color: #dc3545;
        }
        
        .status-count.legal {
            color: #007bff;
        }
        
        .status-separator {
            width: 1px;
            height: 40px;
            background-color: #e0e0e0;
            margin: 0 15px;
        }
        
        .total-row {
            text-align: center;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #f0f0f0;
        }
        
        .total-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .total-count {
            font-size: 20px;
            font-weight: bold;
            color: #333;
        }
        
        /* 자동차 및 건물 아이콘 스타일 */
        .car-icon {
            width: 60px;
            height: 30px;
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            border-radius: 4px;
            position: relative;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        
        .car-icon.blue {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        }
        
        .building-icon {
            width: 50px;
            height: 40px;
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            border-radius: 4px 4px 0 0;
            position: relative;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        
        .building-icon.red {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }
        
        .building-icon::before {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 10%;
            width: 80%;
            height: 8px;
            background: inherit;
            border-radius: 0 0 2px 2px;
        }
    </style>
</head>
<body>
    <jsp:include page="/WEB-INF/views/fragments/header.jsp"/>
    <main class="main container">
        <h2>현황</h2>

        <div class="dashboard">
            <!-- 주차장현황 -->
            <div class="status-panel">
                <div class="panel-header">
                    <h3 class="panel-title">주차장현황 현황</h3>
                </div>
                <div class="panel-body">
                    <div class="status-grid">
                        <div class="status-item">
                            <div class="status-label">서울특별시</div>
                            <div class="car-icon">🚗</div>
                            <div class="status-count seoul">
                                <fmt:formatNumber value="${parkingStatus.seoul_count != null ? parkingStatus.seoul_count : 200}" pattern="#,###"/>
                            </div>
                        </div>
                        
                        <div class="status-separator"></div>
                        
                        <div class="status-item">
                            <div class="status-label">강원도</div>
                            <div class="car-icon blue">🚙</div>
                            <div class="status-count gangwon">
                                <fmt:formatNumber value="${parkingStatus.gangwon_count != null ? parkingStatus.gangwon_count : 100}" pattern="#,###"/>
                            </div>
                        </div>
                    </div>
                    
                    <div class="total-row">
                        <div class="total-label">총</div>
                        <div class="total-count">
                            <fmt:formatNumber value="${parkingStatus.total_count != null ? parkingStatus.total_count : 300}" pattern="#,###"/>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 주차상의용현황 -->
            <div class="status-panel">
                <div class="panel-header">
                    <h3 class="panel-title">주차상의용현황 현황</h3>
                </div>
                <div class="panel-body">
                    <div class="status-grid">
                        <div class="status-item">
                            <div class="status-label">불법</div>
                            <div class="building-icon red">🚫</div>
                            <div class="status-count illegal">
                                <fmt:formatNumber value="${usageStatus.illegal_count != null ? usageStatus.illegal_count : 1950}" pattern="#,###"/>
                            </div>
                        </div>
                        
                        <div class="status-separator"></div>
                        
                        <div class="status-item">
                            <div class="status-label">적법</div>
                            <div class="building-icon blue">✓</div>
                            <div class="status-count legal">
                                <fmt:formatNumber value="${usageStatus.legal_count != null ? usageStatus.legal_count : 182242}" pattern="#,###"/>
                            </div>
                        </div>
                    </div>
                    
                    <div class="total-row">
                        <div class="total-label">총</div>
                        <div class="total-count">
                            <fmt:formatNumber value="${usageStatus.total_usage_count != null ? usageStatus.total_usage_count : 184192}" pattern="#,###"/>
                        </div>
                    </div>
                </div>
            </div>
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
