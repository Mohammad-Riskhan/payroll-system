package com.payroll.controller;

import com.payroll.common.ApiResponse;
import com.payroll.dto.LeaveBalanceDto;
import com.payroll.dto.LeaveRequestDto;
import com.payroll.dto.LeaveTypeDto;
import com.payroll.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<LeaveTypeDto>>> getAllTypes() {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getAllLeaveTypes()));
    }

    @GetMapping("/balances/employee/{empId}")
    public ResponseEntity<ApiResponse<List<LeaveBalanceDto>>> getBalances(
            @PathVariable Long empId,
            @RequestParam(required = false, defaultValue = "2026") Integer year) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getLeaveBalances(empId, year)));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> applyLeave(@Valid @RequestBody LeaveRequestDto dto) {
        LeaveRequestDto created = leaveService.applyLeave(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave applied successfully", created));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getAllRequests(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getAllLeaveRequests(status)));
    }

    @GetMapping("/requests/employee/{empId}")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getEmployeeRequests(@PathVariable Long empId) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getEmployeeLeaveRequests(empId)));
    }

    @PatchMapping("/requests/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        LeaveRequestDto updated = leaveService.updateLeaveStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Leave status updated to " + status, updated));
    }
}
