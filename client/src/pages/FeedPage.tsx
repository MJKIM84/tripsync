import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTripSocket } from '../hooks/useSocket';
import { ArrowLeft, Activity, Calendar, Camera, FileText, DollarSign, Users, CheckSquare, Paperclip } from 'lucide-react';
import api from '../services/api';
import type { ActivityLog, ApiResponse } from '../types';
import { format, isToday, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';

const TARGET_ICONS: Record<string, React.ReactNode> = {
  schedule: <Calendar className="w-4 h-4 text-blue-500" />,
  journal: <FileText className="w-4 h-4 text-green-500" />,
  photo: <Camera className="w-4 h-4 text-purple-500" />,
  budget: <DollarSign className="w-4 h-4 text-yellow-500" />,
  member: <Users className="w-4 h-4 text-pink-500" />,
  checklist: <CheckSquare className="w-4 h-4 text-teal-500" />,
  document: <Paperclip className="w-4 h-4 text-orange-500" />,
  trip: <Activity className="w-4 h-4 text-navy" />,
};

export default function FeedPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const socket = useTripSocket(id);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['feed', id] });
    socket.on('activity:new', refresh);
    return () => { socket.off('activity:new', refresh); };
  }, [socket, id, queryClient]);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['feed', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ActivityLog[]>>(`/trips/${id}/feed`);
      return data.data;
    },
  });

  // Group by date
  const grouped = logs?.reduce<Record<string, ActivityLog[]>>((acc, log) => {
    const date = new Date(log.createdAt);
    const key = isToday(date) ? '오늘' : isYesterday(date) ? '어제' : format(date, 'M월 d일 (E)', { locale: ko });
    (acc[key] = acc[key] || []).push(log);
    return acc;
  }, {}) || {};

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/trips/${id}`} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold">활동 피드</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />)}</div>
      ) : Object.keys(grouped).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-gray-500 mb-3">{date}</h2>
              <div className="space-y-2">
                {items.map((log) => (
                  <div key={log.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                      {TARGET_ICONS[log.targetType] || <Activity className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{log.description}</p>
                      <span className="text-xs text-gray-400">{format(new Date(log.createdAt), 'HH:mm')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>아직 활동 내역이 없습니다</p>
        </div>
      )}
    </div>
  );
}
