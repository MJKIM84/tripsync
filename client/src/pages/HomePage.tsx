import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Camera, Calendar, MapPin } from 'lucide-react';
import { useTrips, useCreateTrip } from '../hooks/useTrips';
import type { Trip } from '../types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const STATUS_LABELS: Record<string, string> = {
  planning: '계획중',
  ongoing: '진행중',
  completed: '완료',
};

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-yellow-100 text-yellow-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
};

export default function HomePage() {
  const [filter, setFilter] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const { data: trips, isLoading } = useTrips(filter || undefined);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">내 여행</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> 새 여행
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['', 'planning', 'ongoing', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-navy text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status ? STATUS_LABELS[status] : '전체'}
          </button>
        ))}
      </div>

      {/* Trip Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-xl mb-4" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : trips && trips.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">아직 여행이 없습니다</h3>
          <p className="text-gray-400 mb-4">새 여행을 만들어 시작해보세요!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-2.5 bg-navy text-white rounded-lg font-medium"
          >
            첫 여행 만들기
          </button>
        </div>
      )}

      {/* Create Trip Modal */}
      {showCreate && <CreateTripModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link
      to={`/trips/${trip.id}`}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div className="h-40 bg-gradient-to-br from-navy/10 to-accent relative">
        {trip.coverImage && (
          <img src={trip.coverImage} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[trip.status]}`}>
            {STATUS_LABELS[trip.status]}
          </span>
        </div>
        {trip.country && (
          <div className="absolute top-3 left-3 text-2xl">{getCountryEmoji(trip.country)}</div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg group-hover:text-navy transition-colors">{trip.title}</h3>

        {(trip.startDate || trip.city) && (
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            {trip.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(trip.startDate), 'M.d', { locale: ko })}
                {trip.endDate && `~${format(new Date(trip.endDate), 'M.d', { locale: ko })}`}
              </span>
            )}
            {trip.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {trip.city}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {trip._count?.members || 0}
          </span>
          <span className="flex items-center gap-1">
            <Camera className="w-3.5 h-3.5" /> {trip._count?.photos || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

function CreateTripModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const createTrip = useCreateTrip();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTrip.mutate(
      { title, country: country || undefined, city: city || undefined, startDate: startDate || undefined, endDate: endDate || undefined },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">새 여행 만들기</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">여행 제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              placeholder="2026 오사카 벚꽃여행"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">나라</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                placeholder="일본"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">도시</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                placeholder="오사카"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50">
              취소
            </button>
            <button type="submit" disabled={createTrip.isPending} className="flex-1 py-2.5 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark disabled:opacity-50">
              {createTrip.isPending ? '생성 중...' : '만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getCountryEmoji(country: string): string {
  const map: Record<string, string> = {
    '일본': '\u{1F1EF}\u{1F1F5}', '한국': '\u{1F1F0}\u{1F1F7}', '미국': '\u{1F1FA}\u{1F1F8}',
    '이탈리아': '\u{1F1EE}\u{1F1F9}', '프랑스': '\u{1F1EB}\u{1F1F7}', '태국': '\u{1F1F9}\u{1F1ED}',
    '영국': '\u{1F1EC}\u{1F1E7}', '호주': '\u{1F1E6}\u{1F1FA}', '스페인': '\u{1F1EA}\u{1F1F8}',
    '독일': '\u{1F1E9}\u{1F1EA}', '베트남': '\u{1F1FB}\u{1F1F3}', '중국': '\u{1F1E8}\u{1F1F3}',
  };
  return map[country] || '\u{1F30D}';
}
