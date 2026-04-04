package com.webtruyenapi.controller;

import com.webtruyenapi.dto.CommentRequest;
import com.webtruyenapi.entity.Comment;
import com.webtruyenapi.service.CommentService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public Comment createComment(
            Authentication authentication,
            @RequestBody CommentRequest req
    ){

        String accountId = (String) authentication.getPrincipal();

        return commentService.createComment(accountId, req);
    }

    @GetMapping("/comic/{comicId}")
    public List<Comment> getComments(@PathVariable String comicId){

        return commentService.getComments(comicId);
    }

}
