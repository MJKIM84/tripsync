import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
          {sent ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">이메일을 확인하세요</h2>
              <p className="text-gray-500 mb-6">비밀번호 재설정 링크를 {email}로 발송했습니다.</p>
              <Link to="/login" className="text-navy font-medium hover:underline">로그인으로 돌아가기</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">비밀번호 찾기</h2>
              <p className="text-sm text-gray-500 mb-6">가입한 이메일을 입력하면 재설정 링크를 보내드립니다.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20"
                    placeholder="your@email.com" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-navy text-white rounded-lg font-medium disabled:opacity-50">
                  {loading ? '발송 중...' : '재설정 링크 발송'}
                </button>
              </form>
              <Link to="/login" className="flex items-center gap-1 text-sm text-gray-500 mt-4 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" /> 로그인으로 돌아가기
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
