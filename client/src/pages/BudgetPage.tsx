import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTripSocket } from '../hooks/useSocket';
import { ArrowLeft, Plus, DollarSign, ArrowRight, X, Trash2 } from 'lucide-react';
import api from '../services/api';
import type { Budget, ApiResponse } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const BUDGET_CATEGORIES = ['식비', '교통', '숙박', '관광', '쇼핑', '기타'];

export default function BudgetPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const socket = useTripSocket(id);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', id] });
      queryClient.invalidateQueries({ queryKey: ['budgets-summary', id] });
    };
    socket.on('budget:created', refresh);
    socket.on('budget:updated', refresh);
    return () => {
      socket.off('budget:created', refresh);
      socket.off('budget:updated', refresh);
    };
  }, [socket, id, queryClient]);

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Budget[]>>(`/trips/${id}/budgets`);
      return data.data;
    },
  });

  const { data: summary } = useQuery({
    queryKey: ['budgets-summary', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>(`/trips/${id}/budgets/summary`);
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (bid: string) => api.delete(`/trips/${id}/budgets/${bid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', id] });
      queryClient.invalidateQueries({ queryKey: ['budgets-summary', id] });
      toast.success('경비가 삭제되었습니다.');
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post(`/trips/${id}/budgets`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', id] });
      queryClient.invalidateQueries({ queryKey: ['budgets-summary', id] });
      toast.success('경비가 추가되었습니다.');
      setShowForm(false);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/trips/${id}`} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold">경비</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark">
          <Plus className="w-4 h-4" /> 경비 추가
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-500">총 경비</div>
            <div className="text-3xl font-bold text-navy">{Number(summary.totalAmount).toLocaleString()}원</div>
          </div>
          {summary.settlements && summary.settlements.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">정산 내역</h3>
              <div className="space-y-2">
                {summary.settlements.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-accent rounded-lg text-sm">
                    <span className="font-medium">{s.fromName}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{s.toName}</span>
                    <span className="font-semibold text-navy">{s.amount.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Budget List */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : budgets && budgets.length > 0 ? (
        <div className="space-y-3">
          {budgets.map((budget) => (
            <div key={budget.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">{budget.title}</div>
                  <div className="text-sm text-gray-500">
                    {budget.payer?.name} {budget.date && `\u00B7 ${format(new Date(budget.date), 'M.d')}`} {budget.category && `\u00B7 ${budget.category}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{Number(budget.amount).toLocaleString()} {budget.currency}</span>
                <button onClick={() => deleteMutation.mutate(budget.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>아직 경비 기록이 없습니다</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">경비 추가</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <BudgetForm onSubmit={(data) => createMutation.mutate(data)} isPending={createMutation.isPending} />
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetForm({ onSubmit, isPending }: { onSubmit: (data: any) => void; isPending: boolean }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ title, amount: Number(amount), category: category || undefined, date: date || undefined }); }} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">항목 *</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="저녁 식사" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">금액 *</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="50000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">선택</option>
            {BUDGET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
      </div>
      <button type="submit" disabled={isPending} className="w-full py-2 bg-navy text-white rounded-lg font-medium disabled:opacity-50">
        {isPending ? '추가 중...' : '추가'}
      </button>
    </form>
  );
}
