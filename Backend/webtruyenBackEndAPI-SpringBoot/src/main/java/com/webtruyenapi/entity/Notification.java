package com.webtruyenapi.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    private UUID id;

    private String title;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String content;

    private String type;

    private boolean isRead;

    private LocalDateTime createdAt;

    private UUID accountId;
}