import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, FileText, Camera, MessageCircle, Users, CheckSquare, X } from 'lucide-react';
import api from '../services/api';
import type { Notification, ApiResponse } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  schedule: <Calendar className="w-4 h-4 text-blue-500" />,
  journal: <FileText className="w-4 h-4 text-green-500" />,
  photo: <Camera className="w-4 h-4 text-purple-500" />,
  chat: <MessageCircle className="w-4 h-4 text-cyan-500" />,
  member: <Users className="w-4 h-4 text-pink-500" />,
  checklist: <CheckSquare className="w-4 h-4 text-teal-500" />,
};

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Notification[]>>('/notifications');
      return data.data;
    },
    refetchInterval: 30000,
  });

  const markAsRead = useMutation({
    mutationFn: (nid: string) => api.put(`/notifications/${nid}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteNotification = useMutation({
    mutationFn: (nid: string) => api.delete(`/notifications/${nid}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleClick = (n: Notification) => {
    if (!n.isRead) markAsRead.mutate(n.id);
    if (n.tripId) navigate(`/trips/${n.tripId}`);
    onClose();
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-sm">알림</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="text-xs text-navy hover:underline"
            >
              모두 읽음
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${
                  !n.isRead ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="mt-0.5">
                  {TYPE_ICONS[n.type] || <Bell className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  {n.title && <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>}
                  {n.message && <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>}
                  <span className="text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ko })}
                  </span>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification.mutate(n.id); }}
                  className="p-0.5 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              알림이 없습니다
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function useUnreadCount() {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Notification[]>>('/notifications');
      return data.data;
    },
    refetchInterval: 30000,
  });
  return data?.filter((n) => !n.isRead).length || 0;
}
