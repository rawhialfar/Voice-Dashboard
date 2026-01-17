// hooks/useUserPermissions.ts
import { useState, useEffect } from 'react';
import { permissionCheck } from '../api/organization';

export interface UserPermissions {
  isAdmin: boolean;
  canReadAnalytics: boolean;
  canSeeConversations: boolean;
}

export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userEmail) {
          setPermissions({
            isAdmin: false,
            canReadAnalytics: false,
            canSeeConversations: false
          });
          setLoading(false);
          return;
        }

        // Check all permissions in parallel using your existing API
        const [isAdmin, canReadAnalytics, canSeeConversations] = await Promise.all([
          permissionCheck({ email: userEmail, permission: 1 << 0}), // 1 << 0 - isAdmin
          permissionCheck({ email: userEmail, permission: 1 << 1}), // 1 << 2 - readAnalytics
          permissionCheck({ email: userEmail, permission: 1 << 2})  // 1 << 1 - readConversationsDetails
        ]);

        setPermissions({
          isAdmin,
          canReadAnalytics,
          canSeeConversations
        });
      } catch (error) {
        console.error('Error checking permissions:', error);
        // Default to most restrictive permissions on error
        setPermissions({
          isAdmin: false,
          canReadAnalytics: false,
          canSeeConversations: false
        });
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, []);

  return { permissions, loading };
};