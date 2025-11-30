import { useState, useEffect, createContext, useContext } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import api from '../api';

/**
 * ============================================================================
 * useAuth Hook - SIWE Authentication
 * ============================================================================
 */

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  /**
   * Sign-In With Ethereum (SIWE)
   */
  const signIn = async () => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Get message to sign
      const { message } = await api.siweStart(address);

      // 2. Sign message
      const signature = await signMessageAsync({ message });

      // 3. Verify signature and get token
      const response = await api.siweVerify(message, signature);

      setUser(response.user);
      setAuthenticated(true);

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign Out
   */
  const signOut = () => {
    api.clearToken();
    setUser(null);
    setAuthenticated(false);
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    if (!authenticated) return;

    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (err) {
      console.error('Error refreshing user:', err);
      // Token inválido, fazer logout
      signOut();
    }
  };

  /**
   * Check if user has token on mount
   */
  useEffect(() => {
    const token = api.getToken();
    if (token && isConnected) {
      refreshUser();
    }
  }, [isConnected]);

  /**
   * Auto sign-out if wallet disconnected
   */
  useEffect(() => {
    if (!isConnected && authenticated) {
      signOut();
    }
  }, [isConnected]);

  const value = {
    user,
    loading,
    error,
    authenticated,
    signIn,
    signOut,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
