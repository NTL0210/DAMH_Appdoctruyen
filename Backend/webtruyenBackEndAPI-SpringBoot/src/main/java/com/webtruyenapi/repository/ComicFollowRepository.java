package com.webtruyenapi.repository;

import com.webtruyenapi.dto.FollowComicDto;
import com.webtruyenapi.entity.ComicFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComicFollowRepository extends JpaRepository<ComicFollow, String> {

    boolean existsByAccountIdAndComicId(String accountId, String comicId);

    Optional<ComicFollow> findByAccountIdAndComicId(String accountId, String comicId);

    @Query("""
SELECT new com.webtruyenapi.dto.FollowComicDto(
    c.comicId,
    c.name,
    c.slug,
    c.thumbUrl,
    f.createdAt
)
FROM ComicFollow f
JOIN Comic c ON f.comicId = c.comicId
WHERE f.accountId = :accountId
""")
    List<FollowComicDto> findFollowedComics(String accountId);

    void deleteByAccountIdAndComicId(String accountId, String comicId);
}