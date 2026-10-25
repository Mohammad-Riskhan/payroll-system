package com.payroll.service;

import com.payroll.dto.AuthRequest;
import com.payroll.dto.AuthResponse;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    AuthResponse getCurrentUser();
}
