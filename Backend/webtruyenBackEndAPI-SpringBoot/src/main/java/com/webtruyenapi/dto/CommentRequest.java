package com.webtruyenapi.dto;

import lombok.Data;

@Data
public class CommentRequest {

    private String comicId;
    private String content;
    private String parentId;

}