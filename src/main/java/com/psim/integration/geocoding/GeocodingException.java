package com.psim.integration.geocoding;

/**
 * 지오코딩 호출 중 발생하는 예외를 감싸는 런타임 예외.
 */
public class GeocodingException extends RuntimeException {
    public GeocodingException(String message) {
        super(message);
    }

    public GeocodingException(String message, Throwable cause) {
        super(message, cause);
    }
}
