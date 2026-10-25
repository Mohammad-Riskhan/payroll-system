package com.payroll.common;

import com.payroll.entity.Role;
import com.payroll.entity.User;
import com.payroll.repository.RoleRepository;
import com.payroll.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and seeding default system roles and administrator accounts...");

        // 1. Ensure SUPER_ADMIN role exists
        Role superAdminRole = findOrCreateRole("SUPER_ADMIN", "Super Administrator with full system control");
        Role roleSuperAdmin = findOrCreateRole("ROLE_SUPER_ADMIN", "Super Administrator with full system control (Spring Security alias)");

        // Ensure other basic roles exist
        findOrCreateRole("ROLE_HR_MANAGER", "Human Resources Manager");
        findOrCreateRole("ROLE_PAYROLL_OFFICER", "Payroll Officer");
        findOrCreateRole("ROLE_ACCOUNTANT", "Accountant");
        findOrCreateRole("ROLE_DEPARTMENT_MANAGER", "Department Manager");
        findOrCreateRole("ROLE_EMPLOYEE", "Employee self-service");

        // 2. Check and seed default 'superadmin' user
        if (userRepository.findByUsername("superadmin").isEmpty()) {
            User superAdminUser = User.builder()
                    .username("superadmin")
                    .email("admin@payroll.lk")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .isActive(true)
                    .roles(new HashSet<>(Set.of(superAdminRole, roleSuperAdmin)))
                    .build();

            userRepository.save(superAdminUser);
            log.info("Default SUPER_ADMIN user created successfully: username='superadmin', email='admin@payroll.lk'");
        } else {
            log.info("SUPER_ADMIN user 'superadmin' already exists in database.");
        }

        // 3. Also ensure the standard 'admin' user exists and has a verified valid password
        Optional<User> adminOpt = userRepository.findByUsername("admin");
        if (adminOpt.isEmpty()) {
            User adminUser = User.builder()
                    .username("admin")
                    .email("admin@lankaprecision.lk")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .isActive(true)
                    .roles(new HashSet<>(Set.of(superAdminRole, roleSuperAdmin)))
                    .build();

            userRepository.save(adminUser);
            log.info("Default 'admin' user created successfully: username='admin', email='admin@lankaprecision.lk'");
        } else {
            User existingAdmin = adminOpt.get();
            if (existingAdmin.getRoles() == null) {
                existingAdmin.setRoles(new HashSet<>());
            }
            existingAdmin.getRoles().add(superAdminRole);
            existingAdmin.getRoles().add(roleSuperAdmin);
            if (!passwordEncoder.matches("Admin@123", existingAdmin.getPasswordHash())) {
                existingAdmin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            }
            userRepository.save(existingAdmin);
            log.info("Verified 'admin' user roles and credentials.");
        }
    }

    private Role findOrCreateRole(String roleName, String description) {
        return roleRepository.findByName(roleName).orElseGet(() -> {
            Role role = Role.builder()
                    .name(roleName)
                    .description(description)
                    .build();
            Role saved = roleRepository.save(role);
            log.info("Created system role: {}", roleName);
            return saved;
        });
    }
}
