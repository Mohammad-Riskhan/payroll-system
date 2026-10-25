package com.payroll.service;

import com.payroll.dto.LeaveBalanceDto;
import com.payroll.dto.LeaveRequestDto;
import com.payroll.dto.LeaveTypeDto;

import java.util.List;

public interface LeaveService {
    List<LeaveTypeDto> getAllLeaveTypes();
    List<LeaveBalanceDto> getLeaveBalances(Long empId, Integer year);
    LeaveRequestDto applyLeave(LeaveRequestDto dto);
    List<LeaveRequestDto> getAllLeaveRequests(String status);
    List<LeaveRequestDto> getEmployeeLeaveRequests(Long empId);
    LeaveRequestDto updateLeaveStatus(Long id, String status);
}
