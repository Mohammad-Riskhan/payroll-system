package com.payroll.controller;

import com.payroll.common.ApiResponse;
import com.payroll.dto.AttendanceDto;
import com.payroll.dto.OvertimeDto;
import com.payroll.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    public ResponseEntity<ApiResponse<AttendanceDto>> recordAttendance(@Valid @RequestBody AttendanceDto dto) {
        AttendanceDto saved = attendanceService.recordAttendance(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attendance recorded successfully", saved));
    }

    @GetMapping("/period/{payPeriod}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'DEPARTMENT_MANAGER')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAttendanceForPeriod(@PathVariable String payPeriod) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getAttendanceForPeriod(payPeriod)));
    }

    @GetMapping("/employee/{empId}/period/{payPeriod}")
    public ResponseEntity<ApiResponse<AttendanceDto>> getEmployeeAttendance(
            @PathVariable Long empId,
            @PathVariable String payPeriod) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getEmployeeAttendance(empId, payPeriod)));
    }

    @PostMapping("/overtime")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    public ResponseEntity<ApiResponse<OvertimeDto>> recordOvertime(@Valid @RequestBody OvertimeDto dto) {
        OvertimeDto saved = attendanceService.recordOvertime(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Overtime recorded successfully", saved));
    }

    @GetMapping("/overtime/period/{payPeriod}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'DEPARTMENT_MANAGER')")
    public ResponseEntity<ApiResponse<List<OvertimeDto>>> getOvertimeForPeriod(@PathVariable String payPeriod) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getOvertimeForPeriod(payPeriod)));
    }

    @GetMapping("/overtime/employee/{empId}/period/{payPeriod}")
    public ResponseEntity<ApiResponse<OvertimeDto>> getEmployeeOvertime(
            @PathVariable Long empId,
            @PathVariable String payPeriod) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getEmployeeOvertime(empId, payPeriod)));
    }
}
