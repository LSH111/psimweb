<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<section class="panel" aria-label="검색 조건">
  <form id="searchForm">
    <!-- 필요한 공통 검색 필드 구성 -->
    <div class="filters">
      <div>
        <label for="sido">시도</label>
        <div class="control">
          <select id="sido" name="sido">
            <option value="">전체</option>
          </select>
        </div>
      </div>
      <div>
        <label for="sigungu">시군구</label>
        <div class="control">
          <select id="sigungu" name="sigungu" disabled>
            <option value="">전체</option>
          </select>
        </div>
      </div>
      <div>
        <label for="emd">읍면동</label>
        <div class="control">
          <select id="emd" name="emd" disabled>
            <option value="">전체</option>
          </select>
        </div>
      </div>
      <div>
        <label for="prkNm">주차장명</label>
        <div class="control">
          <input id="prkNm" name="prkNm" type="text" placeholder="예) 중앙공영주차장" />
        </div>
      </div>
    </div>
    <div class="actions">
      <button type="submit" class="btn">검색</button>
      <button type="button" id="resetBtn" class="btn ghost">초기화</button>
    </div>
  </form>
</section>
