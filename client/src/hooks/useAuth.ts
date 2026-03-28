import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { ApiResponse, User } from '../types';
import toast from 'react-hot-toast';

interface AuthResponse {
  user: User;
  accessToken: string;
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      return data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate('/');
      toast.success(`${data.user.name}님, 환영합니다!`);
    },
    onError: () => toast.error('이메일 또는 비밀번호가 올바르지 않습니다.'),
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (userData: { email: string; password: string; name: string }) => {
      const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
      return data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate('/');
      toast.success('회원가입이 완료되었습니다!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '회원가입에 실패했습니다.';
      toast.error(message);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
      navigate('/login');
    },
  });
}
