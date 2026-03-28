import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTripSocket } from '../hooks/useSocket';
import { ArrowLeft, UserPlus, Users, Crown, Map, Home, UserCircle, X, Trash2 } from 'lucide-react';
import api from '../services/api';
import type { TripMember, ApiResponse } from '../types';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const ROLE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  owner: { label: '주최자', icon: <Crown className="w-3.5 h-3.5" />, color: 'bg-yellow-100 text-yellow-700' },
  traveler: { label: '동행자', icon: <Users className="w-3.5 h-3.5" />, color: 'bg-blue-100 text-blue-700' },
  guide: { label: '가이드', icon: <Map className="w-3.5 h-3.5" />, color: 'bg-green-100 text-green-700' },
  family: { label: '가족', icon: <Home className="w-3.5 h-3.5" />, color: 'bg-pink-100 text-pink-700' },
  friend: { label: '친구', icon: <UserCircle className="w-3.5 h-3.5" />, color: 'bg-purple-100 text-purple-700' },
};

export default function MembersPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(s => s.user);
  const [showInvite, setShowInvite] = useState(false);
  const socket = useTripSocket(id);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['members', id] });
    socket.on('member:joined', refresh);
    return () => { socket.off('member:joined', refresh); };
  }, [socket, id, queryClient]);

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TripMember[]>>(`/trips/${id}/members`);
      return data.data;
    },
  });

  const currentMember = members?.find(m => m.userId === currentUser?.id);
  const isOwner = currentMember?.role === 'owner';

  const removeMutation = useMutation({
    mutationFn: (uid: string) => api.delete(`/trips/${id}/members/${uid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', id] });
      toast.success('참여자가 제거되었습니다.');
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/trips/${id}`} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold">참여자</h1>
          {members && <span className="text-sm text-gray-400">{members.length}명</span>}
        </div>
        {isOwner && (
          <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark">
            <UserPlus className="w-4 h-4" /> 초대
          </button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)
        ) : (
          members?.map((member) => (
            <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-sm font-medium text-navy">
                  {member.user.avatarUrl
                    ? <img src={member.user.avatarUrl} className="w-full h-full rounded-full object-cover" />
                    : member.user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{member.user.name}</div>
                  <div className="text-sm text-gray-500">{member.user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_LABELS[member.role].color}`}>
                  {ROLE_LABELS[member.role].icon}
                  {ROLE_LABELS[member.role].label}
                </span>
                {isOwner && member.role !== 'owner' && (
                  <button onClick={() => removeMutation.mutate(member.userId)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showInvite && <InviteModal tripId={id!} onClose={() => setShowInvite(false)} />}
    </div>
  );
}

function InviteModal({ tripId, onClose }: { tripId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('traveler');

  const inviteMutation = useMutation({
    mutationFn: () => api.post(`/trips/${tripId}/members/invite`, { email, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', tripId] });
      toast.success('초대가 완료되었습니다.');
      onClose();
    },
    onError: (error: any) => toast.error(error.response?.data?.error?.message || '초대에 실패했습니다.'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">참여자 초대</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); inviteMutation.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" placeholder="friend@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20">
              <option value="traveler">동행자 (Traveler)</option>
              <option value="guide">가이드 (Guide)</option>
              <option value="family">가족 (Family)</option>
              <option value="friend">친구 (Friend)</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600">취소</button>
            <button type="submit" disabled={inviteMutation.isPending} className="flex-1 py-2 bg-navy text-white rounded-lg font-medium disabled:opacity-50">
              {inviteMutation.isPending ? '초대 중...' : '초대'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
