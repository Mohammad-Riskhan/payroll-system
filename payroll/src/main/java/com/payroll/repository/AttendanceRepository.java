package com.payroll.repository;

import com.payroll.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByEmployeeIdAndPayPeriod(Long employeeId, String payPeriod);
    List<Attendance> findByPayPeriod(String payPeriod);
}
