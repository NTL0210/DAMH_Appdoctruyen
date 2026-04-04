package com.webtruyenapi.controller.admin;

import com.webtruyenapi.dto.admin.DashboardStatsDTO;
import com.webtruyenapi.service.admin.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping
    public DashboardStatsDTO getDashboardStats(){

        return dashboardService.getDashboardStats();

    }

}