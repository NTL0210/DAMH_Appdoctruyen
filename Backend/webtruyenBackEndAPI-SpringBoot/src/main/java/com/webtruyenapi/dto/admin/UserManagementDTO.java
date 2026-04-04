package com.webtruyenapi.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserManagementDTO {

    private String accountId;

    private String email;

    private String username;

    private String role;

    private String status;

}
