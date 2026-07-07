package codewithhimanshu.hospital.service;

import codewithhimanshu.hospital.security.AppUserEntity;
import codewithhimanshu.hospital.security.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AppUserServiceImpl
 * ==================
 * 1. Implements UserDetailsService  → Spring Security uses this for login
 * 2. Implements AppUserService      → HospitalManagementService uses this
 *                                     for role-based data scoping
 *
 * ROLE-BASED SCOPING:
 *  ROLE_ADMIN   → accountId = null  → HospitalManagementService returns ALL data
 *  Others       → accountId = their accountId → data scoped to their hospital only
 */
@Service("appUserService")
@RequiredArgsConstructor
@Slf4j
public class AppUserServiceImpl implements UserDetailsService, AppUserService {

    private final AppUserRepository userRepo;

    // ─────────────────────────────────────────────────────────────
    // UserDetailsService  (called by Spring Security on login)
    // ─────────────────────────────────────────────────────────────

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUserEntity user = userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRoles().trim())   // e.g. "ROLE_ADMIN"
                .disabled(!Boolean.TRUE.equals(user.getIsActive()))
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // AppUserService  (called by HospitalManagementService)
    // ─────────────────────────────────────────────────────────────

    /**
     * ADMIN  → returns null  (service queries ALL accounts)
     * Others → returns their accountId (service filters by this value)
     */
    @Override
    public Long getLoggedInUserAccountId() {
        if (isAdmin()) return null;
        return getCurrentUserEntity().getAccountId();
    }

    @Override
    public Long getLoggedInUserId() {
        return getCurrentUserEntity().getUserId();
    }

    @Override
    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    // ─────────────────────────────────────────────────────────────
    // Registration  (called by AuthController)
    // ─────────────────────────────────────────────────────────────

    /**
     * Registers a new user. Each new registration gets its own isolated
     * accountId (= their own userId after first save).
     * ADMIN role cannot be registered via API — must be done via SQL.
     */
    public AppUserEntity registerUser(String username, String rawPassword, String role) {
        if (userRepo.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken: " + username);
        }
        String encodedPwd = new BCryptPasswordEncoder().encode(rawPassword);
        AppUserEntity entity = AppUserEntity.builder()
                .username(username)
                .password(encodedPwd)
                .roles("ROLE_" + role.toUpperCase())
                .isActive(true)
                .build();
        AppUserEntity saved = userRepo.save(entity);
        // Self-assign accountId = own userId (isolated tenant per registration)
        saved.setAccountId(saved.getUserId());
        return userRepo.save(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────────────────────

    private AppUserEntity getCurrentUserEntity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found in SecurityContext");
        }
        return userRepo.findByUsername(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + auth.getName()));
    }
}
