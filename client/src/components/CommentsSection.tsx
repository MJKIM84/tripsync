import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import api from '../services/api';
import type { Comment, ApiResponse } from '../types';
import { useAuthStore } from '../stores/authStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Props {
  tripId: string;
  targetType: string;
  targetId: string;
}

export default function CommentsSection({ tripId, targetType, targetId }: Props) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');

  const queryKey = ['comments', tripId, targetType, targetId];

  const { data: comments } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Comment[]>>(
        `/trips/${tripId}/comments?targetType=${targetType}&targetId=${targetId}`
      );
      return data.data;
    },
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (body: { targetType: string; targetId: string; content: string }) => {
      const { data } = await api.post<ApiResponse<Comment>>(`/trips/${tripId}/comments`, body);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setContent('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (cid: string) => api.delete(`/trips/${tripId}/comments/${cid}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate({ targetType, targetId, content: content.trim() });
  };

  const count = comments?.length || 0;

  return (
    <div className="mt-3 border-t border-gray-100 pt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        댓글 {count > 0 && <span className="text-navy font-medium">{count}</span>}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2">
          {comments && comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2 group">
                  <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center text-[10px] font-medium text-navy shrink-0">
                    {c.user?.avatarUrl ? (
                      <img src={c.user.avatarUrl} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      c.user?.name?.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700">{c.user?.name}</span>
                      <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: ko })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{c.content}</p>
                  </div>
                  {c.userId === user?.id && (
                    <button
                      onClick={() => deleteMutation.mutate(c.id)}
                      className="p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="댓글 작성..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20"
            />
            <button
              type="submit"
              disabled={!content.trim() || createMutation.isPending}
              className="p-1.5 bg-navy text-white rounded-lg disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
