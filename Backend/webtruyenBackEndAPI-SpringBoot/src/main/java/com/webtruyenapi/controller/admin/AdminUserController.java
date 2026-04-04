package com.webtruyenapi.controller.admin;

import com.webtruyenapi.dto.admin.UserManagementDTO;
import com.webtruyenapi.service.admin.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public Page<UserManagementDTO> getUsers(

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size

    ){

        return adminUserService.getUsers(page,size);

    }

    @GetMapping("/search")
    public Page<UserManagementDTO> searchUsers(

            @RequestParam String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size

    ){

        return adminUserService.searchUsers(email,page,size);

    }

    @PutMapping("/{id}/ban")
    public void banUser(@PathVariable String id){

        adminUserService.banUser(id);

    }

    @PutMapping("/{id}/unban")
    public void unbanUser(@PathVariable String id){

        adminUserService.unbanUser(id);

    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id){

        adminUserService.deleteUser(id);

    }

}