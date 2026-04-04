package com.webtruyenapi.service;

import com.webtruyenapi.dto.FollowComicDto;
import com.webtruyenapi.entity.ComicFollow;
import com.webtruyenapi.repository.ComicFollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComicFollowService {

    private final ComicFollowRepository followRepository;

    public void followComic(String accountId, String comicId) {

        boolean exists =
                followRepository.existsByAccountIdAndComicId(accountId, comicId);

        if (exists) {
            throw new RuntimeException("Already followed");
        }

        ComicFollow follow = new ComicFollow();
        follow.setAccountId(accountId);
        follow.setComicId(comicId);

        followRepository.save(follow);
    }

    public List<FollowComicDto> getFollowedComics(String accountId) {
        return followRepository.findFollowedComics(accountId);
    }

    @Transactional
    public void unfollowComic(String accountId, String comicId) {

        followRepository.deleteByAccountIdAndComicId(accountId, comicId);
    }
}