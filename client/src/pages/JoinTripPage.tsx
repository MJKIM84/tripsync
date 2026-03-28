import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Compass, MapPin, Calendar, Users } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const ROLE_LABELS: Record<string, string> = {
  traveler: '동행자', guide: '가이드', family: '가족', friend: '친구',
};

export default function JoinTripPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [info, setInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get(`/trips/join/${token}/info`)
      .then(res => setInfo(res.data.data))
      .catch(err => setError(err.response?.data?.error?.message || '유효하지 않은 초대 링크입니다.'));
  }, [token]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/join/${token}`);
      return;
    }
    setJoining(true);
    try {
      const { data } = await api.post(`/trips/join/${token}`);
      if (data.data.alreadyMember) {
        toast.success('이미 참여 중인 여행입니다.');
      } else {
        toast.success('여행에 참여했습니다!');
      }
      navigate(`/trips/${data.data.tripId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || '참여에 실패했습니다.');
    } finally {
      setJoining(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
        <div className="text-center">
          <Compass className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">초대 링크 오류</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/" className="text-navy font-medium hover:underline">홈으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-pulse text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Compass className="w-10 h-10 text-navy mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-navy">여행 초대</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-navy/10 to-accent relative">
            {info.trip.coverImage && (
              <img src={info.trip.coverImage} alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-4 text-white">
              <h2 className="text-lg font-bold">{info.trip.title}</h2>
              <div className="flex items-center gap-2 text-sm text-white/80">
                {info.trip.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{info.trip.city}</span>}
                {info.trip.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(info.trip.startDate), 'M.d', { locale: ko })}
                    {info.trip.endDate && `~${format(new Date(info.trip.endDate), 'M.d', { locale: ko })}`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-center mb-4">
              <strong>{info.inviterName}</strong>님이 <strong>{ROLE_LABELS[info.role] || info.role}</strong> 역할로 초대했습니다
            </p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy-dark disabled:opacity-50 transition-colors"
            >
              {joining ? '참여 중...' : isAuthenticated ? '여행 참여하기' : '로그인 후 참여하기'}
            </button>
            {!isAuthenticated && (
              <p className="text-center text-sm text-gray-500 mt-3">
                계정이 없으신가요? <Link to={`/register?redirect=/join/${token}`} className="text-navy font-medium hover:underline">회원가입</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
