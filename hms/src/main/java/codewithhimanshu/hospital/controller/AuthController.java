package codewithhimanshu.hospital.controller;

import codewithhimanshu.hospital.config.JwtUtils;
import codewithhimanshu.hospital.service.AppUserServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController
 * ==============
 * POST /auth/login    → returns JWT token (no auth needed)
 * POST /auth/register → creates new hospital account (no auth needed)
 *
 * ADMIN account must be created directly via SQL (cannot self-register).
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login and Registration endpoints")
public class AuthController {

    private final AuthenticationManager  authManager;
    private final AppUserServiceImpl     appUserService;
    private final JwtUtils               jwtUtils;

    // ── DTOs ─────────────────────────────────────────────────────

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Username is required")
        private String username;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Username is required")
        private String username;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        /**
         * Allowed values: HOSPITAL_ADMIN, DOCTOR, RECEPTIONIST,
         *                 BILLING_EXECUTIVE, WARD_MANAGER, FINANCE_ADMIN
         * (ADMIN role can only be created via SQL — not via API)
         */
        @NotBlank(message = "Role is required")
        private String role;
    }

    // ── Endpoints ─────────────────────────────────────────────────

    /**
     * LOGIN
     * ─────
     * Request  : { "username": "admin@hms.com", "password": "Admin@123" }
     * Response : { "token": "eyJ...", "username": "...", "roles": "..." }
     *
     * Use the token as:  Authorization: Bearer <token>
     */
    @PostMapping("/login")
    @Operation(summary = "Login — returns JWT Bearer token")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid username or password"));
        } catch (DisabledException e) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Account is disabled. Contact administrator."));
        }

        UserDetails userDetails = appUserService.loadUserByUsername(req.getUsername());
        String token = jwtUtils.generateToken(userDetails);

        return ResponseEntity.ok(Map.of(
                "token",    token,
                "username", userDetails.getUsername(),
                "roles",    userDetails.getAuthorities().toString()
        ));
    }

    /**
     * REGISTER
     * ────────
     * Creates a new hospital account (isolated tenant).
     * ADMIN role is blocked — must be inserted directly in DB.
     *
     * Request  : { "username": "doc@hospital.com", "password": "pass123", "role": "DOCTOR" }
     * Response : { "message": "...", "userId": 1, "accountId": 1, "username": "...", "roles": "..." }
     */
    @PostMapping("/register")
    @Operation(summary = "Register new hospital account")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        // Block ADMIN self-registration
        if ("ADMIN".equalsIgnoreCase(req.getRole())) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "ADMIN role cannot be self-registered. Contact system administrator."));
        }

        try {
            var user = appUserService.registerUser(req.getUsername(), req.getPassword(), req.getRole());
            return ResponseEntity.status(201).body(Map.of(
                    "message",   "Account created successfully",
                    "userId",    user.getUserId(),
                    "accountId", user.getAccountId(),
                    "username",  user.getUsername(),
                    "roles",     user.getRoles()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}