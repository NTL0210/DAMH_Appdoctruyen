package com.webtruyenapi.service.admin;

import com.webtruyenapi.entity.Account;
import com.webtruyenapi.entity.Notification;
import com.webtruyenapi.repository.AccountRepository;
import com.webtruyenapi.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AccountRepository accountRepository;

    public void sendNotificationToUser(UUID accountId, String title, String content, String type) {

        Notification notification = new Notification();

        notification.setId(UUID.randomUUID());
        notification.setAccountId(accountId);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setType(type);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }
    public void broadcastNotification(String title,
                                      String content,
                                      String type) {

        List<Account> users = accountRepository.findAll();

        for (Account user : users) {

            Notification notification = new Notification();

            notification.setId(UUID.randomUUID());
            notification.setAccountId(UUID.fromString(user.getAccountId()));
            notification.setTitle(title);
            notification.setContent(content);
            notification.setType(type);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());

            notificationRepository.save(notification);
        }
    }

    public List<Notification> getUserNotifications(UUID accountId) {
        return notificationRepository.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    public void markAsRead(UUID notificationId) {

        Notification n = notificationRepository.findById(notificationId).orElseThrow();

        n.setRead(true);

        notificationRepository.save(n);
    }

}
