import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, MessageCircle, Reply, X } from 'lucide-react';
import api from '../services/api';
import type { ChatMessage, ApiResponse } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useTripSocket } from '../hooks/useSocket';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const socket = useTripSocket(id);
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['chat', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ChatMessage[]>>(`/trips/${id}/chat`);
      return data.data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (body: { content: string; replyToId?: string }) => {
      const { data } = await api.post<ApiResponse<ChatMessage>>(`/trips/${id}/chat`, body);
      return data.data;
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<ChatMessage[]>(['chat', id], (old) =>
        old ? [...old, newMessage] : [newMessage]
      );
      socket?.emit('chat:send', newMessage);
      setReplyTo(null);
      setMessage('');
    },
  });

  // Socket: receive messages
  useEffect(() => {
    if (!socket) return;
    const handleMessage = (data: ChatMessage) => {
      if (data.senderId === user?.id) return;
      queryClient.setQueryData<ChatMessage[]>(['chat', id], (old) =>
        old ? [...old, data] : [data]
      );
    };
    const handleTyping = (data: { userId: string; name: string }) => {
      if (data.userId === user?.id) return;
      setTypingUsers((prev) => new Map(prev).set(data.userId, data.name));
    };
    const handleStopTyping = (data: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    };
    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:stop_typing', handleStopTyping);
    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stop_typing', handleStopTyping);
    };
  }, [socket, id, user?.id, queryClient]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = useCallback(() => {
    socket?.emit('chat:typing', { tripId: id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('chat:stop_typing', { tripId: id });
    }, 2000);
  }, [socket, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket?.emit('chat:stop_typing', { tripId: id });
    sendMutation.mutate({
      content: message.trim(),
      replyToId: replyTo?.id,
    });
  };

  // Group messages by date
  const groupedByDate = (messages || []).reduce<Record<string, ChatMessage[]>>((acc, msg) => {
    const dateKey = new Date(msg.createdAt).toLocaleDateString('ko-KR');
    (acc[dateKey] = acc[dateKey] || []).push(msg);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <Link to={`/trips/${id}`} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">채팅</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse mx-4" />
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          Object.entries(groupedByDate).map(([date, msgs]) => (
            <div key={date}>
              <div className="text-center my-4">
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{date}</span>
              </div>
              {msgs.map((msg) => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 py-0.5 group`}>
                    <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {!isOwn && (
                        <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-xs font-medium text-navy shrink-0">
                          {msg.sender?.avatarUrl ? (
                            <img src={msg.sender.avatarUrl} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            msg.sender?.name?.charAt(0)
                          )}
                        </div>
                      )}
                      <div>
                        {!isOwn && (
                          <span className="text-xs text-gray-500 ml-1">{msg.sender?.name}</span>
                        )}
                        {msg.replyTo && (
                          <div className={`text-xs px-3 py-1 rounded-t-lg border-l-2 border-navy/30 bg-gray-50 ${isOwn ? 'text-right' : ''}`}>
                            <span className="text-gray-400">{msg.replyTo.sender?.name}</span>
                            <p className="text-gray-500 truncate">{msg.replyTo.content}</p>
                          </div>
                        )}
                        <div className={`px-3.5 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-navy text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : ''}`}>
                          <span className="text-[10px] text-gray-400">
                            {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={() => setReplyTo(msg)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-200"
                          >
                            <Reply className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-gray-500">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>아직 메시지가 없습니다</p>
            <p className="text-sm text-gray-400 mt-1">첫 메시지를 보내보세요!</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicators */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-1 text-xs text-gray-400">
          {Array.from(typingUsers.values()).join(', ')}님이 입력 중...
        </div>
      )}

      {/* Reply indicator */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Reply className="w-4 h-4" />
            <span className="font-medium">{replyTo.sender?.name}</span>
            <span className="truncate max-w-[200px]">{replyTo.content}</span>
          </div>
          <button onClick={() => setReplyTo(null)} className="p-1 rounded hover:bg-gray-200">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
          placeholder="메시지를 입력하세요..."
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-navy/20"
        />
        <button
          type="submit"
          disabled={!message.trim() || sendMutation.isPending}
          className="p-2.5 bg-navy text-white rounded-full disabled:opacity-50 hover:bg-navy-dark transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
