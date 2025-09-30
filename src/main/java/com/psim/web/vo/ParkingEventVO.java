package com.psim.web.vo;

public class ParkingEventVO {
    private Long id;
    private Long lotId;
    private String carNo;
    private String type;
    private String at;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLotId() { return lotId; }
    public void setLotId(Long lotId) { this.lotId = lotId; }
    public String getCarNo() { return carNo; }
    public void setCarNo(String carNo) { this.carNo = carNo; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getAt() { return at; }
    public void setAt(String at) { this.at = at; }
}
