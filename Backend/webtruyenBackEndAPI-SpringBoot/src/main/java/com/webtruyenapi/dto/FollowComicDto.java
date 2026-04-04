package com.webtruyenapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class FollowComicDto {

    private String comicId;
    private String name;
    private String slug;
    private String thumbUrl;
    private LocalDateTime followedAt;
}