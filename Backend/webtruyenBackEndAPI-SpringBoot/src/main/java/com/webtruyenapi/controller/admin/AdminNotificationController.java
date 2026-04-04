package com.webtruyenapi.controller.admin;

import com.webtruyenapi.dto.admin.BroadcastNotificationRequest;
import com.webtruyenapi.dto.admin.NotificationRequest;
import com.webtruyenapi.service.admin.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    public String sendNotification(@RequestBody NotificationRequest request) {

        notificationService.sendNotificationToUser(
                request.getAccountId(),
                request.getTitle(),
                request.getContent(),
                request.getType()
        );

        return "Notification sent";
    }

    @PostMapping("/broadcast")
    public String broadcast(@RequestBody BroadcastNotificationRequest request) {

        notificationService.broadcastNotification(
                request.getTitle(),
                request.getContent(),
                request.getType()
        );

        return "Notification sent to all users";
    }
}
