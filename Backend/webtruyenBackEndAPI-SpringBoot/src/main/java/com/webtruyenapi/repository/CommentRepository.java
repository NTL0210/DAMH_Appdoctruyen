package com.webtruyenapi.repository;

import com.webtruyenapi.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, String> {

    List<Comment> findByComic_ComicIdOrderByCreatedAtDesc(String comicId);

    long countByCreatedAtAfter(LocalDateTime date);

}