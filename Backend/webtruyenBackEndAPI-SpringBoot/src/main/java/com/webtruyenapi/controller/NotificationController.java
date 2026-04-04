package com.webtruyenapi.controller;


import com.webtruyenapi.entity.Notification;
import com.webtruyenapi.service.admin.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<Notification> getMyNotifications() {

        String accountId = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return notificationService.getUserNotifications(UUID.fromString(accountId));
    }

}