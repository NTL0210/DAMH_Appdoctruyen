package com.webtruyenapi.dto.admin;

import lombok.Data;
import java.util.UUID;

@Data
public class NotificationRequest {

    private String title;

    private String content;

    private String type;

    private UUID accountId;

}
