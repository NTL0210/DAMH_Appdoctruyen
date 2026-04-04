package com.webtruyenapi.service.admin;

import com.webtruyenapi.dto.admin.DashboardStatsDTO;
import com.webtruyenapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final AccountRepository accountRepository;
    private final ComicRepository comicRepository;
    private final ChapterRepository chapterRepository;
    private final CommentRepository commentRepository;

    public DashboardStatsDTO getDashboardStats(){

        long totalUsers = accountRepository.count();

        long totalComics = comicRepository.count();

        long totalChapters = chapterRepository.count();

        long totalComments = commentRepository.count();

        LocalDateTime today = LocalDate.now().atStartOfDay();

        long newUsersToday = accountRepository.countByCreatedAtAfter(today);

        long newCommentsToday = commentRepository.countByCreatedAtAfter(today);

        return new DashboardStatsDTO(
                totalUsers,
                totalComics,
                totalChapters,
                totalComments,
                newUsersToday,
                newCommentsToday
        );
    }

}