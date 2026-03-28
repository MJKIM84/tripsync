import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Compass } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch {
      toast.error('토큰이 만료되었거나 유효하지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">유효하지 않은 링크입니다.</p>
          <Link to="/login" className="text-navy font-medium hover:underline">로그인으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Compass className="w-10 h-10 text-navy" />
            <h1 className="text-3xl font-bold text-navy">TripSync</h1>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {done ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">비밀번호 변경 완료</h2>
              <p className="text-gray-500 mb-6">새 비밀번호로 로그인해주세요.</p>
              <Link to="/login" className="px-6 py-2.5 bg-navy text-white rounded-lg font-medium inline-block">로그인</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-6">새 비밀번호 설정</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20"
                    placeholder="8자 이상" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-navy text-white rounded-lg font-medium disabled:opacity-50">
                  {loading ? '변경 중...' : '비밀번호 변경'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
