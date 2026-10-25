package com.payroll.service;

import com.payroll.dto.AttendanceDto;
import com.payroll.dto.OvertimeDto;

import java.util.List;

public interface AttendanceService {
    AttendanceDto recordAttendance(AttendanceDto dto);
    List<AttendanceDto> getAttendanceForPeriod(String payPeriod);
    AttendanceDto getEmployeeAttendance(Long empId, String payPeriod);

    OvertimeDto recordOvertime(OvertimeDto dto);
    List<OvertimeDto> getOvertimeForPeriod(String payPeriod);
    OvertimeDto getEmployeeOvertime(Long empId, String payPeriod);
}
