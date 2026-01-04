/**
 * Profile utility functions for safe name handling
 */

/**
 * Extracts the first name from a full name string
 * Handles edge cases like empty strings, multiple spaces, and null values
 */
export const getFirstName = (fullName: string | null | undefined): string => {
    if (!fullName?.trim()) return 'Guardian';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    return parts[0] || 'Guardian';
};

/**
 * Generates initials from a full name
 * Returns first letter of first name + first letter of last name
 * Falls back to 'U' for unknown
 */
export const getInitials = (fullName: string | null | undefined): string => {
    if (!fullName?.trim()) return 'U';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    // First + Last name initials
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Gets a display name from profile data
 * Prioritizes full name, falls back to email username, then 'User'
 */
export const getDisplayName = (
    fullName: string | null | undefined,
    email: string | null | undefined
): string => {
    if (fullName?.trim()) return fullName.trim();
    if (email) return email.split('@')[0];
    return 'User';
};
