import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Calendar, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { Trip, ApiResponse } from '../types';

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data: trips } = useQuery({
    queryKey: ['search-trips'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Trip[]>>('/trips');
      return data.data;
    },
  });

  const filtered = trips?.filter(t => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.city?.toLowerCase().includes(q) ||
      t.country?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  }) || [];

  const handleSelect = (tripId: string) => {
    navigate(`/trips/${tripId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="여행, 도시, 나라 검색..."
            className="flex-1 outline-none text-base"
          />
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {query.trim() && filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">검색 결과가 없습니다</div>
          )}
          {filtered.map(trip => (
            <button
              key={trip.id}
              onClick={() => handleSelect(trip.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-navy shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{trip.title}</div>
                <div className="text-xs text-gray-500">
                  {[trip.city, trip.country].filter(Boolean).join(', ')}
                </div>
              </div>
            </button>
          ))}
          {!query.trim() && (
            <div className="py-8 text-center text-sm text-gray-400">검색어를 입력하세요</div>
          )}
        </div>
      </div>
    </div>
  );
}
