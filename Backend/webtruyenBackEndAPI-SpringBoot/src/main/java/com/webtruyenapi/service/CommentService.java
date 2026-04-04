package com.webtruyenapi.service;

import com.webtruyenapi.dto.CommentRequest;
import com.webtruyenapi.entity.*;
import com.webtruyenapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ComicRepository comicRepository;
    private final AccountRepository accountRepository;

    public Comment createComment(String accountId, CommentRequest req){

        Comic comic = comicRepository.findById(req.getComicId())
                .orElseThrow(() -> new RuntimeException("Comic not found"));

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();

        comment.setCommentId(UUID.randomUUID().toString());
        comment.setComic(comic);
        comment.setAccount(account);
        comment.setContent(req.getContent());
        comment.setParentId(req.getParentId());
        comment.setCreatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    public List<Comment> getComments(String comicId){
        return commentRepository.findByComic_ComicIdOrderByCreatedAtDesc(comicId);
    }

}