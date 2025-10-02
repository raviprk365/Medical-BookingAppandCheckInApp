'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  category: 'appointment' | 'check_in' | 'lab_results' | 'message' | 'system';
  title: string;
  message: string;
  patientId?: string;
  appointmentId?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

// Base API URL
const API_BASE = 'http://localhost:3001';

// Query Keys
const notificationQueryKeys = {
  notifications: ['notifications'] as const,
} as const;

// API Functions
const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await fetch(`${API_BASE}/notifications`);
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
};

const updateNotificationAPI = async ({ notificationId, isRead }: { notificationId: string; isRead: boolean }) => {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isRead }),
  });
  if (!response.ok) throw new Error('Failed to update notification');
  return response.json();
};

const createNotificationAPI = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
  const response = await fetch(`${API_BASE}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...notification,
      createdAt: new Date().toISOString()
    }),
  });
  if (!response.ok) throw new Error('Failed to create notification');
  return response.json();
};

// Custom hook for notifications - OPTIMIZED WITH REACT QUERY
export function useNotifications() {
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: notificationQueryKeys.notifications,
    queryFn: fetchNotifications,
    staleTime: 1 * 60 * 1000, // 1 minute - notifications are time-sensitive
    refetchInterval: 2 * 60 * 1000, // 2 minutes - OPTIMIZED from 30 seconds!
    refetchIntervalInBackground: false,
    select: (data) => {
      // Sort by priority and creation time
      return data.sort((a: Notification, b: Notification) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  });

  const queryClient = useQueryClient();

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: ({ notificationId }: { notificationId: string }) => 
      updateNotificationAPI({ notificationId, isRead: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications });
    }
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter((n: Notification) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((notif: Notification) =>
          updateNotificationAPI({ notificationId: notif.id, isRead: true })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications });
    }
  });

  // Create new notification
  const createNotificationMutation = useMutation({
    mutationFn: createNotificationAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications });
    }
  });

  // Get recent unread notifications (for dashboard display)
  const recentNotifications = notifications
    .filter((n: Notification) => !n.isRead)
    .slice(0, 5);

  // Get unread count
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  return {
    notifications,
    recentNotifications,
    unreadCount,
    loading: isLoading,
    error: error?.message || null,
    markAsRead: (notificationId: string) => markAsReadMutation.mutate({ notificationId }),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => 
      createNotificationMutation.mutate(notification),
    refetch: () => queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications })
  };
}

// Helper function to get notification icon and color based on type
export function getNotificationStyle(type: Notification['type']) {
  switch (type) {
    case 'success':
      return {
        bgColor: 'bg-green-50',
        textColor: 'text-green-900',
        iconColor: 'text-green-600',
        descColor: 'text-green-700'
      };
    case 'warning':
      return {
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-900',
        iconColor: 'text-orange-600',
        descColor: 'text-orange-700'
      };
    case 'info':
      return {
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-900',
        iconColor: 'text-blue-600',
        descColor: 'text-blue-700'
      };
    case 'error':
      return {
        bgColor: 'bg-red-50',
        textColor: 'text-red-900',
        iconColor: 'text-red-600',
        descColor: 'text-red-700'
      };
    default:
      return {
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-900',
        iconColor: 'text-gray-600',
        descColor: 'text-gray-700'
      };
  }
}

// Helper function to get notification icon based on category
export function getNotificationIcon(category: Notification['category']) {
  switch (category) {
    case 'appointment':
      return 'calendar';
    case 'check_in':
      return 'check-circle';
    case 'lab_results':
      return 'file-text';
    case 'message':
      return 'message-square';
    case 'system':
      return 'settings';
    default:
      return 'bell';
  }
}
