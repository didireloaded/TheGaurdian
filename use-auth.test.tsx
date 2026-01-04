import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from './use-auth';

// Mock the supabase client
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        auth: {
            getSession: () => mockGetSession(),
            onAuthStateChange: () => mockOnAuthStateChange(),
        },
    },
}));

describe('useAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUnsubscribe.mockReturnValue(undefined);
        mockOnAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: mockUnsubscribe } },
        });
    });

    it('should initialize with loading state', async () => {
        // Mock a delayed response
        mockGetSession.mockReturnValue(new Promise(() => { }));

        const { result } = renderHook(() => useAuth());

        expect(result.current.loading).toBe(true);
        expect(result.current.user).toBe(null);
    });

    it('should set user when session exists', async () => {
        const mockUser = { id: '123', email: 'test@example.com' };
        const mockSession = { user: mockUser };

        mockGetSession.mockResolvedValue({ data: { session: mockSession } });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle no session', async () => {
        mockGetSession.mockResolvedValue({ data: { session: null } });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toBe(null);
        expect(result.current.isAuthenticated).toBe(false);
    });
});
