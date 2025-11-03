package com.psim.web.api.service;

import com.psim.web.api.vo.KakaoAddress2CoordResponse;
import com.psim.web.api.vo.KakaoCoord2AddressResponse;
import com.psim.web.api.vo.KakaoCoord2RegionResponse;

public interface KakaoLocalService {
    
    /**
     * 좌표를 주소로 변환
     * @param longitude 경도 (x)
     * @param latitude 위도 (y)
     * @return 주소 정보
     */
    KakaoCoord2AddressResponse convertCoord2Address(String longitude, String latitude);
    
    /**
     * 주소를 좌표로 변환
     * @param address 주소 (지번 또는 도로명)
     * @return 좌표 정보
     */
    KakaoAddress2CoordResponse convertAddress2Coord(String address);

    /**
     * 좌표로 행정구역 정보 가져오기
     * @param longitude 경도 (x)
     * @param latitude 위도 (y)
     * @return 행정구역 정보
     */
    KakaoCoord2RegionResponse convertCoord2Region(String longitude, String latitude);
}
