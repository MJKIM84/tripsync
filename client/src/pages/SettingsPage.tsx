import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Lock, Heart, Camera } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function SettingsPage() {
  const user = useAuthStore(s => s.user);
  const setAuth = useAuthStore(s => s.setAuth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [bloodType, setBloodType] = useState(user?.bloodType || '');
  const [allergies, setAllergies] = useState(user?.allergies || '');
  const [emergencyContactName, setEmergencyContactName] = useState(user?.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user?.emergencyContactPhone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Fetch full profile on mount
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/settings/profile');
      return data.data;
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBloodType(profile.bloodType || '');
      setAllergies(profile.allergies || '');
      setEmergencyContactName(profile.emergencyContactName || '');
      setEmergencyContactPhone(profile.emergencyContactPhone || '');
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { data } = await api.put('/settings/profile', {
        name,
        bloodType: bloodType || null,
        allergies: allergies || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
      });
      return data.data;
    },
    onSuccess: (data) => {
      if (user) setAuth({ ...user, ...data }, useAuthStore.getState().accessToken!);
      toast.success('프로필이 수정되었습니다.');
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.post('/settings/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: (data) => {
      if (user) setAuth({ ...user, avatarUrl: data.avatarUrl }, useAuthStore.getState().accessToken!);
      toast.success('프로필 사진이 변경되었습니다.');
    },
    onError: () => toast.error('업로드에 실패했습니다.'),
  });

  const changePassword = useMutation({
    mutationFn: () => api.put('/auth/change-password', { currentPassword, newPassword }),
    onSuccess: () => {
      toast.success('비밀번호가 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || '비밀번호 변경에 실패했습니다.'),
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">설정</h1>

      {/* Profile */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-navy" />
          <h2 className="text-lg font-semibold">프로필</h2>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-navy flex items-center justify-center">
                <span className="text-white text-2xl font-medium">{user?.name?.charAt(0)}</span>
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
            >
              <Camera className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadAvatar.mutate(e.target.files[0])}
            />
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); updateProfile.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input type="email" value={user?.email || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" />
          </div>
          <button type="submit" disabled={updateProfile.isPending} className="px-6 py-2 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50">
            저장
          </button>
        </form>
      </section>

      {/* Emergency Info */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold">비상 연락처</h2>
        </div>
        <form onSubmit={e => { e.preventDefault(); updateProfile.mutate(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">혈액형</label>
              <select value={bloodType} onChange={e => setBloodType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20">
                <option value="">선택안함</option>
                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비상 연락처 이름</label>
              <input type="text" value={emergencyContactName} onChange={e => setEmergencyContactName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" placeholder="홍길동" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비상 연락처 전화번호</label>
            <input type="tel" value={emergencyContactPhone} onChange={e => setEmergencyContactPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" placeholder="010-1234-5678" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">알레르기</label>
            <textarea value={allergies} onChange={e => setAllergies(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" placeholder="견과류, 갑각류 등" />
          </div>
          <button type="submit" disabled={updateProfile.isPending} className="px-6 py-2 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50">
            저장
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-navy" />
          <h2 className="text-lg font-semibold">비밀번호 변경</h2>
        </div>
        <form onSubmit={e => { e.preventDefault(); changePassword.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" required />
          </div>
          <button type="submit" disabled={changePassword.isPending} className="px-6 py-2 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50">
            변경
          </button>
        </form>
      </section>
    </div>
  );
}
