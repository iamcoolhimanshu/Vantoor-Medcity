package codewithhimanshu.hospital.service;

/**
 * Used by HospitalManagementService to get the logged-in user's identity.
 */
public interface AppUserService {

    /** Returns accountId of current user. NULL if ADMIN (sees all). */
    Long getLoggedInUserAccountId();

    /** Returns userId (PK) of current user — used for audit trail. */
    Long getLoggedInUserId();

    /** True if current user has ROLE_ADMIN. */
    boolean isAdmin();
}
