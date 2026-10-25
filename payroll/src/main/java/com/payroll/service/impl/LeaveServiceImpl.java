package com.payroll.service.impl;

import com.payroll.common.BadRequestException;
import com.payroll.common.ResourceNotFoundException;
import com.payroll.dto.LeaveBalanceDto;
import com.payroll.dto.LeaveRequestDto;
import com.payroll.dto.LeaveTypeDto;
import com.payroll.entity.Employee;
import com.payroll.entity.LeaveBalance;
import com.payroll.entity.LeaveRequest;
import com.payroll.entity.LeaveType;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.LeaveBalanceRepository;
import com.payroll.repository.LeaveRequestRepository;
import com.payroll.repository.LeaveTypeRepository;
import com.payroll.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveServiceImpl implements LeaveService {

    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LeaveTypeDto> getAllLeaveTypes() {
        return leaveTypeRepository.findAll().stream()
                .map(lt -> LeaveTypeDto.builder()
                        .id(lt.getId())
                        .name(lt.getName())
                        .maxDaysPerYear(lt.getMaxDaysPerYear())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<LeaveBalanceDto> getLeaveBalances(Long empId, Integer year) {
        Employee employee = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + empId));

        // Auto-seed leave balances for the year if not present
        List<LeaveType> allTypes = leaveTypeRepository.findAll();
        for (LeaveType type : allTypes) {
            leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(empId, type.getId(), year)
                    .orElseGet(() -> {
                        LeaveBalance newBalance = LeaveBalance.builder()
                                .employee(employee)
                                .leaveType(type)
                                .year(year)
                                .allocatedDays(new BigDecimal(type.getMaxDaysPerYear()))
                                .usedDays(BigDecimal.ZERO)
                                .build();
                        return leaveBalanceRepository.save(newBalance);
                    });
        }

        return leaveBalanceRepository.findByEmployeeIdAndYear(empId, year).stream()
                .map(b -> LeaveBalanceDto.builder()
                        .id(b.getId())
                        .empId(b.getEmployee().getId())
                        .empNo(b.getEmployee().getEmpNo())
                        .employeeName(b.getEmployee().getFirstName() + " " + b.getEmployee().getLastName())
                        .leaveTypeId(b.getLeaveType().getId())
                        .leaveTypeName(b.getLeaveType().getName())
                        .year(b.getYear())
                        .allocatedDays(b.getAllocatedDays())
                        .usedDays(b.getUsedDays())
                        .remainingDays(b.getAllocatedDays().subtract(b.getUsedDays()))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LeaveRequestDto applyLeave(LeaveRequestDto dto) {
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        Employee employee = employeeRepository.findById(dto.getEmpId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getEmpId()));

        LeaveType leaveType = leaveTypeRepository.findById(dto.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not found with id: " + dto.getLeaveTypeId()));

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(leaveType)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status("PENDING")
                .build();

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getAllLeaveRequests(String status) {
        List<LeaveRequest> requests = (status != null && !status.isBlank())
                ? leaveRequestRepository.findByStatusOrderByStartDateDesc(status.toUpperCase())
                : leaveRequestRepository.findAll();

        return requests.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getEmployeeLeaveRequests(Long empId) {
        return leaveRequestRepository.findByEmployeeIdOrderByStartDateDesc(empId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LeaveRequestDto updateLeaveStatus(Long id, String status) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));

        String newStatus = status.toUpperCase();
        if ("APPROVED".equals(newStatus) && !"APPROVED".equals(request.getStatus())) {
            // Deduct from balance
            long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
            int year = request.getStartDate().getYear();
            leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                    request.getEmployee().getId(), request.getLeaveType().getId(), year)
                    .ifPresent(balance -> {
                        balance.setUsedDays(balance.getUsedDays().add(new BigDecimal(days)));
                        leaveBalanceRepository.save(balance);
                    });
        }

        request.setStatus(newStatus);
        LeaveRequest updated = leaveRequestRepository.save(request);
        return mapToDto(updated);
    }

    private LeaveRequestDto mapToDto(LeaveRequest r) {
        return LeaveRequestDto.builder()
                .id(r.getId())
                .empId(r.getEmployee().getId())
                .empNo(r.getEmployee().getEmpNo())
                .employeeName(r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName())
                .leaveTypeId(r.getLeaveType().getId())
                .leaveTypeName(r.getLeaveType().getName())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .status(r.getStatus())
                .build();
    }
}
