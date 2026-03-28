import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTripSocket } from '../hooks/useSocket';
import { ArrowLeft, Plus, FileText, MapPin, X } from 'lucide-react';
import CommentsSection from '../components/CommentsSection';
import api from '../services/api';
import type { Journal, ApiResponse } from '../types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';

const MOODS: Record<string, string> = {
  happy: '\u{1F60A}', excited: '\u{1F929}', relaxed: '\u{1F60C}', love: '\u{1F970}',
  tired: '\u{1F62B}', sad: '\u{1F622}', surprised: '\u{1F632}', neutral: '\u{1F610}',
};

export default function JournalPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const socket = useTripSocket(id);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['journals', id] });
    socket.on('journal:created', refresh);
    return () => { socket.off('journal:created', refresh); };
  }, [socket, id, queryClient]);

  const { data: journals, isLoading } = useQuery({
    queryKey: ['journals', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Journal[]>>(`/trips/${id}/journals`);
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: { date: string; title?: string; content?: string; mood?: string; locationName?: string }) => {
      return api.post(`/trips/${id}/journals`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals', id] });
      toast.success('기록이 작성되었습니다.');
      setShowForm(false);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/trips/${id}`} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold">여행 기록</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark">
          <Plus className="w-4 h-4" /> 기록 작성
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : journals && journals.length > 0 ? (
        <div className="space-y-4">
          {journals.map((journal) => (
            <div key={journal.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-500">{format(new Date(journal.date), 'yyyy년 M월 d일 (E)', { locale: ko })}</span>
                    {journal.mood && <span className="text-lg">{MOODS[journal.mood] || journal.mood}</span>}
                  </div>
                  {journal.title && <h3 className="text-lg font-semibold">{journal.title}</h3>}
                </div>
                {journal.author && (
                  <span className="text-xs text-gray-400">{journal.author.name}</span>
                )}
              </div>
              {journal.content && <p className="text-gray-600 mt-2 whitespace-pre-wrap">{journal.content}</p>}
              {journal.locationName && (
                <span className="text-xs text-gray-400 flex items-center gap-1 mt-2"><MapPin className="w-3 h-3" /> {journal.locationName}</span>
              )}
              {journal.photos && journal.photos.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {journal.photos.map(p => (
                    <img key={p.id} src={p.thumbnailPath || p.filePath} className="w-16 h-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}
              <CommentsSection tripId={id!} targetType="journal" targetId={journal.id} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>아직 기록이 없습니다</p>
        </div>
      )}

      {showForm && (
        <JournalForm onSubmit={(data) => createMutation.mutate(data)} onClose={() => setShowForm(false)} isPending={createMutation.isPending} />
      )}
    </div>
  );
}

function JournalForm({ onSubmit, onClose, isPending }: { onSubmit: (data: any) => void; onClose: () => void; isPending: boolean }) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [locationName, setLocationName] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">기록 작성</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ date, title: title || undefined, content: content || undefined, mood: mood || undefined, locationName: locationName || undefined }); }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">기분</label>
              <div className="flex gap-1 flex-wrap">
                {Object.entries(MOODS).map(([key, emoji]) => (
                  <button key={key} type="button" onClick={() => setMood(mood === key ? '' : key)}
                    className={`text-xl p-1 rounded ${mood === key ? 'bg-accent ring-2 ring-navy/20' : 'hover:bg-gray-100'}`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" placeholder="오늘의 여행" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" placeholder="오늘 있었던 일을 기록해보세요..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
            <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" placeholder="도톤보리" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600">취소</button>
            <button type="submit" disabled={isPending} className="flex-1 py-2 bg-navy text-white rounded-lg font-medium disabled:opacity-50">
              {isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
