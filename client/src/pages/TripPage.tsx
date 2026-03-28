import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar, FileText, Camera, MapPin, DollarSign, CheckSquare,
  Paperclip, Users, Activity, Settings, ChevronRight, Trash2,
  MessageCircle,
} from 'lucide-react';
import { useTrip, useDeleteTrip } from '../hooks/useTrips';
import { useTripSocket } from '../hooks/useSocket';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const STATUS_LABELS: Record<string, string> = {
  planning: '계획중',
  ongoing: '진행중',
  completed: '완료',
};

const NAV_ITEMS = [
  { path: 'schedule', icon: Calendar, label: '일정', color: 'text-blue-500' },
  { path: 'journal', icon: FileText, label: '기록', color: 'text-green-500' },
  { path: 'gallery', icon: Camera, label: '갤러리', color: 'text-purple-500' },
  { path: 'budget', icon: DollarSign, label: '경비', color: 'text-yellow-500' },
  { path: 'checklist', icon: CheckSquare, label: '체크리스트', color: 'text-teal-500' },
  { path: 'documents', icon: Paperclip, label: '문서', color: 'text-orange-500' },
  { path: 'places', icon: MapPin, label: '장소', color: 'text-red-500' },
  { path: 'members', icon: Users, label: '참여자', color: 'text-pink-500' },
  { path: 'chat', icon: MessageCircle, label: '채팅', color: 'text-cyan-500' },
  { path: 'feed', icon: Activity, label: '활동 피드', color: 'text-indigo-500' },
];

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const { data: trip, isLoading } = useTrip(id!);
  const deleteTrip = useDeleteTrip();
  const navigate = useNavigate();
  useTripSocket(id);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!trip) return <div className="text-center py-20 text-gray-500">여행을 찾을 수 없습니다.</div>;

  return (
    <div>
      {/* Trip Header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="h-48 bg-gradient-to-br from-navy/10 to-accent relative">
          {trip.coverImage && (
            <img src={trip.coverImage} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <h1 className="text-2xl font-bold">{trip.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-white/80">
              {trip.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {trip.city}{trip.country && `, ${trip.country}`}</span>}
              {trip.startDate && (
                <span>
                  {format(new Date(trip.startDate), 'yyyy.M.d', { locale: ko })}
                  {trip.endDate && ` ~ ${format(new Date(trip.endDate), 'M.d', { locale: ko })}`}
                </span>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              trip.status === 'ongoing' ? 'bg-green-500 text-white' :
              trip.status === 'planning' ? 'bg-yellow-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {STATUS_LABELS[trip.status]}
            </span>
          </div>
        </div>

        {/* Members strip */}
        {trip.members && trip.members.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-3">
            <span className="text-sm text-gray-500">참여자</span>
            <div className="flex -space-x-2">
              {trip.members.slice(0, 5).map((m) => (
                <div key={m.id} className="w-7 h-7 rounded-full bg-navy/10 border-2 border-white flex items-center justify-center text-xs font-medium text-navy" title={`${m.user.name} (${m.role})`}>
                  {m.user.avatarUrl ? <img src={m.user.avatarUrl} className="w-full h-full rounded-full object-cover" /> : m.user.name.charAt(0)}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-400">{trip._count?.members || trip.members.length}명</span>
          </div>
        )}
      </div>

      {/* Trip Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* D-Day / Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">여행 상태</h3>
          {trip.startDate && (
            <div className="text-center">
              {(() => {
                const now = new Date();
                const start = new Date(trip.startDate);
                const end = trip.endDate ? new Date(trip.endDate) : start;
                const diffStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const diffEnd = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (diffStart > 0) {
                  return (
                    <>
                      <div className="text-3xl font-bold text-navy">D-{diffStart}</div>
                      <div className="text-sm text-gray-500 mt-1">여행까지 {diffStart}일 남았습니다</div>
                    </>
                  );
                } else if (diffEnd >= 0) {
                  const currentDay = Math.abs(diffStart) + 1;
                  return (
                    <>
                      <div className="text-3xl font-bold text-green-600">Day {currentDay}</div>
                      <div className="text-sm text-gray-500 mt-1">여행 중입니다!</div>
                    </>
                  );
                } else {
                  return (
                    <>
                      <div className="text-2xl font-bold text-gray-400">여행 완료</div>
                      <div className="text-sm text-gray-500 mt-1">{Math.abs(diffEnd)}일 전에 끝났습니다</div>
                    </>
                  );
                }
              })()}
            </div>
          )}
        </div>

        {/* Today's Schedule Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {trip.startDate && new Date(trip.startDate) <= new Date() ? '오늘 일정' : '첫째 날 일정'}
          </h3>
          {trip._count?.schedules ? (
            <Link to={`/trips/${id}/schedule`} className="text-sm text-navy hover:underline">
              {trip._count.schedules}개 일정 보기 →
            </Link>
          ) : (
            <p className="text-sm text-gray-400">아직 일정이 없습니다</p>
          )}
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={`/trips/${id}/${item.path}`}
            className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 hover:shadow-md active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="font-medium text-sm md:text-base text-gray-700">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      {trip._count && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">요약</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-navy">{trip._count.schedules || 0}</div>
              <div className="text-xs text-gray-500">일정</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">{trip._count.journals || 0}</div>
              <div className="text-xs text-gray-500">기록</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">{trip._count.photos || 0}</div>
              <div className="text-xs text-gray-500">사진</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">{trip._count.members || 0}</div>
              <div className="text-xs text-gray-500">참여자</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">{trip._count.budgets || 0}</div>
              <div className="text-xs text-gray-500">경비</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
