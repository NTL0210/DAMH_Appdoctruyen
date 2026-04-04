package com.webtruyenapi.service.admin;

import com.webtruyenapi.dto.admin.ComicManagementDTO;
import com.webtruyenapi.entity.Comic;
import com.webtruyenapi.entity.ComicStatus;
import com.webtruyenapi.repository.ComicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminComicService {

    private final ComicRepository comicRepository;

    public Page<ComicManagementDTO> getComics(int page, int size){

        Pageable pageable = PageRequest.of(page,size);

        return comicRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    public Page<ComicManagementDTO> searchComics(String name,int page,int size){

        Pageable pageable = PageRequest.of(page,size);

        return comicRepository
                .findByNameContainingIgnoreCase(name,pageable)
                .map(this::convertToDTO);
    }

    public void approveComic(String comicId){

        Comic comic = comicRepository.findById(comicId)
                .orElseThrow();

        comic.setStatus(ComicStatus.completed);

        comicRepository.save(comic);
    }

    public void hideComic(String comicId){

        Comic comic = comicRepository.findById(comicId)
                .orElseThrow();

        comic.setStatus(ComicStatus.HIDDEN);

        comicRepository.save(comic);
    }

    public void deleteComic(String comicId){

        Comic comic = comicRepository.findById(comicId)
                .orElseThrow();

        comic.setStatus(ComicStatus.DELETED);

        comicRepository.save(comic);
    }

    private ComicManagementDTO convertToDTO(Comic comic){

        return new ComicManagementDTO(
                comic.getComicId(),
                comic.getName(),
                comic.getThumbUrl(),
                comic.getStatus().name()
        );
    }

}