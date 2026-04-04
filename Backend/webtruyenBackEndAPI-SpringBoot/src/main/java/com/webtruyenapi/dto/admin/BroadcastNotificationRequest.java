package com.webtruyenapi.dto.admin;


import lombok.Data;

@Data
public class BroadcastNotificationRequest {

    private String title;

    private String content;

    private String type;

}
