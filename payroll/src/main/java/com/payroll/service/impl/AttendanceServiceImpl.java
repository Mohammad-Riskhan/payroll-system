package com.payroll.service.impl;

import com.payroll.common.ResourceNotFoundException;
import com.payroll.dto.AttendanceDto;
import com.payroll.dto.OvertimeDto;
import com.payroll.entity.Attendance;
import com.payroll.entity.Employee;
import com.payroll.entity.Overtime;
import com.payroll.repository.AttendanceRepository;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.OvertimeRepository;
import com.payroll.service.AttendanceService;
import com.payroll.statutory.StatutoryStrategyFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final OvertimeRepository overtimeRepository;
    private final EmployeeRepository employeeRepository;
    private final StatutoryStrategyFactory statutoryStrategyFactory;

    @Override
    @Transactional
    public AttendanceDto recordAttendance(AttendanceDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmpId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getEmpId()));

        Attendance attendance = attendanceRepository.findByEmployeeIdAndPayPeriod(dto.getEmpId(), dto.getPayPeriod())
                .orElse(Attendance.builder()
                        .employee(employee)
                        .payPeriod(dto.getPayPeriod())
                        .build());

        attendance.setWorkedDays(dto.getWorkedDays());
        attendance.setNoPayDays(dto.getNoPayDays() != null ? dto.getNoPayDays() : BigDecimal.ZERO);

        Attendance saved = attendanceRepository.save(attendance);
        dto.setId(saved.getId());
        dto.setEmpNo(employee.getEmpNo());
        dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDto> getAttendanceForPeriod(String payPeriod) {
        return attendanceRepository.findByPayPeriod(payPeriod).stream()
                .map(a -> AttendanceDto.builder()
                        .id(a.getId())
                        .empId(a.getEmployee().getId())
                        .empNo(a.getEmployee().getEmpNo())
                        .employeeName(a.getEmployee().getFirstName() + " " + a.getEmployee().getLastName())
                        .payPeriod(a.getPayPeriod())
                        .workedDays(a.getWorkedDays())
                        .noPayDays(a.getNoPayDays())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceDto getEmployeeAttendance(Long empId, String payPeriod) {
        return attendanceRepository.findByEmployeeIdAndPayPeriod(empId, payPeriod)
                .map(a -> AttendanceDto.builder()
                        .id(a.getId())
                        .empId(a.getEmployee().getId())
                        .empNo(a.getEmployee().getEmpNo())
                        .employeeName(a.getEmployee().getFirstName() + " " + a.getEmployee().getLastName())
                        .payPeriod(a.getPayPeriod())
                        .workedDays(a.getWorkedDays())
                        .noPayDays(a.getNoPayDays())
                        .build())
                .orElse(null);
    }

    @Override
    @Transactional
    public OvertimeDto recordOvertime(OvertimeDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmpId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getEmpId()));

        // Computed using formula: (Basic Salary / 240) * 1.5 * OT Hours
        BigDecimal otAmount = dto.getOtAmount();
        if (otAmount == null || otAmount.compareTo(BigDecimal.ZERO) <= 0) {
            otAmount = statutoryStrategyFactory.getDefaultStrategy()
                    .calculateOvertime(employee.getBasicSalary(), dto.getOtHours(), LocalDate.now());
        }

        Overtime overtime = overtimeRepository.findByEmployeeIdAndPayPeriod(dto.getEmpId(), dto.getPayPeriod())
                .orElse(Overtime.builder()
                        .employee(employee)
                        .payPeriod(dto.getPayPeriod())
                        .build());

        overtime.setOtHours(dto.getOtHours());
        overtime.setOtAmount(otAmount);

        Overtime saved = overtimeRepository.save(overtime);
        dto.setId(saved.getId());
        dto.setEmpNo(employee.getEmpNo());
        dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        dto.setOtAmount(saved.getOtAmount());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OvertimeDto> getOvertimeForPeriod(String payPeriod) {
        return overtimeRepository.findByPayPeriod(payPeriod).stream()
                .map(o -> OvertimeDto.builder()
                        .id(o.getId())
                        .empId(o.getEmployee().getId())
                        .empNo(o.getEmployee().getEmpNo())
                        .employeeName(o.getEmployee().getFirstName() + " " + o.getEmployee().getLastName())
                        .payPeriod(o.getPayPeriod())
                        .otHours(o.getOtHours())
                        .otAmount(o.getOtAmount())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OvertimeDto getEmployeeOvertime(Long empId, String payPeriod) {
        return overtimeRepository.findByEmployeeIdAndPayPeriod(empId, payPeriod)
                .map(o -> OvertimeDto.builder()
                        .id(o.getId())
                        .empId(o.getEmployee().getId())
                        .empNo(o.getEmployee().getEmpNo())
                        .employeeName(o.getEmployee().getFirstName() + " " + o.getEmployee().getLastName())
                        .payPeriod(o.getPayPeriod())
                        .otHours(o.getOtHours())
                        .otAmount(o.getOtAmount())
                        .build())
                .orElse(null);
    }
}
