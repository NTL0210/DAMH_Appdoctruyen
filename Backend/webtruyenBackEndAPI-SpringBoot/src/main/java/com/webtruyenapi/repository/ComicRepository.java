package com.webtruyenapi.repository;

import com.webtruyenapi.dto.ComicSummaryDTO;
import com.webtruyenapi.entity.Comic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComicRepository extends JpaRepository<Comic, String> {
    Page<Comic> findByStatusInOrderByUpdatedAtDesc(List<String> status, Pageable pageable);

    @Query("SELECT c FROM Comic c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Comic> searchByName(@Param("keyword") String keyword);

    Optional<Comic> findBySlug(String slug);

    List<Comic> findByComicGenres_GenreId(String genreId);

    @Query("""
SELECT new com.webtruyenapi.dto.ComicSummaryDTO(
    c.comicId,
    c.name,
    c.thumbUrl,
    c.chaptersLatest,
    c.updatedAt
)
FROM Comic c
WHERE LOWER(TRIM(c.status)) IN ('ongoing','completed')
ORDER BY c.updatedAt DESC
""")
    Page<ComicSummaryDTO> findComicPage(Pageable pageable);

    @Query("""
SELECT new com.webtruyenapi.dto.ComicSummaryDTO(
    c.comicId,
    c.name,
    c.thumbUrl,
    c.chaptersLatest,
    c.updatedAt
)
FROM Comic c
WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
AND LOWER(TRIM(c.status)) IN ('ongoing','completed')
ORDER BY c.updatedAt DESC
""")
    List<ComicSummaryDTO> searchComic(@Param("keyword") String keyword);

    @Query("""
SELECT new com.webtruyenapi.dto.ComicSummaryDTO(
    c.comicId,
    c.name,
    c.thumbUrl,
    c.chaptersLatest,
    c.updatedAt
)
FROM Comic c
JOIN c.comicGenres cg
WHERE cg.genre.genreId = :genreId
AND LOWER(TRIM(c.status)) IN ('ongoing','completed')
ORDER BY c.updatedAt DESC
""")
    List<ComicSummaryDTO> findComicByGenre(@Param("genreId") String genreId);
    Page<Comic> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Optional<Comic> findByComicIdAndStatusIn(String comicId, List<String> status);

    @Query("""
SELECT c
FROM Comic c
WHERE c.comicId = :comicId
AND LOWER(TRIM(c.status)) IN ('ongoing','completed')
""")
    Optional<Comic> findActiveComicById(@Param("comicId") String comicId);

}
