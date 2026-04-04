package com.webtruyenapi.controller;

import com.webtruyenapi.dto.FollowComicDto;
import com.webtruyenapi.dto.FollowDtos.*;
import com.webtruyenapi.entity.Account;
import com.webtruyenapi.entity.ComicFollow;
import com.webtruyenapi.entity.Follow;
import com.webtruyenapi.repository.AccountRepository;
import com.webtruyenapi.repository.ComicFollowRepository;
import com.webtruyenapi.repository.FollowRepository;
import com.webtruyenapi.service.ComicFollowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {

    private final ComicFollowService followService;
    private final AccountRepository accountRepository;

    @PostMapping("/{comicId}")
    public ResponseEntity<?> followComic(
            @PathVariable String comicId,
            Authentication authentication
    ) {

        String accountId = authentication.getName();
        Account account = accountRepository
                .findById(accountId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        followService.followComic(account.getAccountId(), comicId);

        return ResponseEntity.ok("Followed");
    }

    @GetMapping("/my")
    public List<FollowComicDto> getMyFollows(Authentication authentication) {

        String accountId = authentication.getName();

        Account account = accountRepository
                .findById(accountId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return followService.getFollowedComics(account.getAccountId());
    }

    @DeleteMapping("/{comicId}")
    public ResponseEntity<?> unfollowComic(
            @PathVariable String comicId,
            Authentication authentication
    ) {

        String accountId = authentication.getName();

        Account account = accountRepository
                .findById(accountId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        followService.unfollowComic(account.getAccountId(), comicId);

        return ResponseEntity.ok("Unfollowed");
    }
}