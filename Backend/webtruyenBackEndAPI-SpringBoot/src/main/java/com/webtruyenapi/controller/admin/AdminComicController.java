package com.webtruyenapi.controller.admin;

import com.webtruyenapi.dto.admin.ComicManagementDTO;
import com.webtruyenapi.service.admin.AdminComicService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/comics")
@RequiredArgsConstructor
public class AdminComicController {

    private final AdminComicService adminComicService;

    @GetMapping
    public Page<ComicManagementDTO> getComics(

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size

    ){

        return adminComicService.getComics(page,size);

    }

    @GetMapping("/search")
    public Page<ComicManagementDTO> searchComics(

            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size

    ){

        return adminComicService.searchComics(name,page,size);

    }

    @PutMapping("/{id}/approve")
    public void approveComic(@PathVariable String id){

        adminComicService.approveComic(id);

    }

    @PutMapping("/{id}/hide")
    public void hideComic(@PathVariable String id){

        adminComicService.hideComic(id);

    }

    @DeleteMapping("/{id}")
    public void deleteComic(@PathVariable String id){

        adminComicService.deleteComic(id);

    }

}
