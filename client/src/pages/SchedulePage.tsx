import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTripSocket } from '../hooks/useSocket';
import { ArrowLeft, Plus, Clock, MapPin, Plane, Utensils, Landmark, Hotel, ShoppingBag, Edit2, Trash2, X } from 'lucide-react';
import CommentsSection from '../components/CommentsSection';
import api from '../services/api';
import type { Schedule, ApiResponse } from '../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  transport: <Plane className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  sightseeing: <Landmark className="w-4 h-4" />,
  hotel: <Hotel className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
};

const CATEGORIES = [
  { value: 'transport', label: '교통' },
  { value: 'food', label: '식사' },
  { value: 'sightseeing', label: '관광' },
  { value: 'hotel', label: '숙소' },
  { value: 'shopping', label: '쇼핑' },
  { value: 'other', label: '기타' },
];

export default function SchedulePage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const socket = useTripSocket(id);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['schedules', id] });
    socket.on('schedule:created', refresh);
    socket.on('schedule:updated', refresh);
    socket.on('schedule:deleted', refresh);
    return () => {
      socket.off('schedule:created', refresh);
      socket.off('schedule:updated', refresh);
      socket.off('schedule:deleted', refresh);
    };
  }, [socket, id, queryClient]);

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['schedules', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Schedule[]>>(`/trips/${id}/schedules`);
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (sid: string) => api.delete(`/trips/${id}/schedules/${sid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', id] });
      toast.success('일정이 삭제되었습니다.');
    },
  });

  // Group by day
  const grouped = schedules?.reduce<Record<number, Schedule[]>>((acc, s) => {
    (acc[s.dayNumber] = acc[s.dayNumber] || []).push(s);
    return acc;
  }, {}) || {};

  const days = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/trips/${id}`} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">일정</h1>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark"
        >
          <Plus className="w-4 h-4" /> 일정 추가
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : days.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>아직 일정이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-6">
          {days.map((day) => (
            <div key={day}>
              <h2 className="text-lg font-semibold mb-3 text-navy">
                Day {day}
                {grouped[day][0]?.date && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    {format(new Date(grouped[day][0].date), 'M월 d일 (E)', { locale: ko })}
                  </span>
                )}
              </h2>
              <div className="space-y-2">
                {grouped[day].map((schedule) => (
                  <div key={schedule.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-navy shrink-0">
                      {schedule.category ? CATEGORY_ICONS[schedule.category] || <Clock className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {schedule.startTime && (
                          <span className="text-sm font-mono text-gray-500">{schedule.startTime}</span>
                        )}
                        <h3 className="font-medium">{schedule.title}</h3>
                      </div>
                      {schedule.description && <p className="text-sm text-gray-500 mt-0.5">{schedule.description}</p>}
                      {schedule.locationName && (
                        <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {schedule.locationName}
                        </span>
                      )}
                      <CommentsSection tripId={id!} targetType="schedule" targetId={schedule.id} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(schedule.id); setShowForm(true); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(schedule.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ScheduleForm
          tripId={id!}
          editingSchedule={editingId ? schedules?.find(s => s.id === editingId) : undefined}
          onClose={() => { setShowForm(false); setEditingId(null); }}
        />
      )}
    </div>
  );
}

function ScheduleForm({ tripId, editingSchedule, onClose }: { tripId: string; editingSchedule?: Schedule; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(editingSchedule?.title || '');
  const [dayNumber, setDayNumber] = useState(editingSchedule?.dayNumber || 1);
  const [startTime, setStartTime] = useState(editingSchedule?.startTime || '');
  const [description, setDescription] = useState(editingSchedule?.description || '');
  const [locationName, setLocationName] = useState(editingSchedule?.locationName || '');
  const [category, setCategory] = useState(editingSchedule?.category || '');

  const mutation = useMutation({
    mutationFn: async () => {
      const body = { title, dayNumber, startTime: startTime || undefined, description: description || undefined, locationName: locationName || undefined, category: category || undefined };
      if (editingSchedule) {
        return api.put(`/trips/${tripId}/schedules/${editingSchedule.id}`, body);
      }
      return api.post(`/trips/${tripId}/schedules`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', tripId] });
      toast.success(editingSchedule ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.');
      onClose();
    },
    onError: () => toast.error('일정 저장에 실패했습니다.'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{editingSchedule ? '일정 수정' : '일정 추가'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <input type="number" min={1} value={dayNumber} onChange={(e) => setDayNumber(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" placeholder="이치란 라멘" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
            <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" placeholder="도톤보리" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20">
              <option value="">선택안함</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600">취소</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 py-2 bg-navy text-white rounded-lg font-medium disabled:opacity-50">
              {mutation.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
