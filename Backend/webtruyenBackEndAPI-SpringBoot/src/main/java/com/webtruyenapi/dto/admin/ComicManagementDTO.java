package com.webtruyenapi.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ComicManagementDTO {

    private String comicId;

    private String name;

    private String coverImage;

    private String status;

}