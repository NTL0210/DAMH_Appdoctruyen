package com.webtruyenapi.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStatsDTO {

    private long totalUsers;

    private long totalComics;

    private long totalChapters;

    private long totalComments;

    private long newUsersToday;

    private long newCommentsToday;

}
