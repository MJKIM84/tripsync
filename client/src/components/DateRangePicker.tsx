import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Props {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export default function DateRangePicker({ startDate, endDate, onChange }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => startDate ? new Date(startDate) : new Date());
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const handleDayClick = (d: Date) => {
    const dateStr = format(d, 'yyyy-MM-dd');
    if (selecting === 'start') {
      onChange(dateStr, '');
      setSelecting('end');
    } else {
      if (start && isBefore(d, start)) {
        onChange(dateStr, '');
        setSelecting('end');
      } else {
        onChange(startDate, dateStr);
        setSelecting('start');
      }
    }
  };

  const isInRange = (d: Date) => {
    if (!start || !end) return false;
    return isWithinInterval(d, { start, end });
  };

  const isStart = (d: Date) => start ? isSameDay(d, start) : false;
  const isEnd = (d: Date) => end ? isSameDay(d, end) : false;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header labels */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setSelecting('start')}
          className={`flex-1 text-center py-2 rounded-lg text-sm font-medium border ${
            selecting === 'start' ? 'border-navy bg-accent text-navy' : 'border-gray-200 text-gray-500'
          }`}
        >
          <div className="text-[10px] text-gray-400 mb-0.5">시작일</div>
          {startDate ? format(new Date(startDate), 'M월 d일 (E)', { locale: ko }) : '선택'}
        </button>
        <button
          type="button"
          onClick={() => setSelecting('end')}
          className={`flex-1 text-center py-2 rounded-lg text-sm font-medium border ${
            selecting === 'end' ? 'border-navy bg-accent text-navy' : 'border-gray-200 text-gray-500'
          }`}
        >
          <div className="text-[10px] text-gray-400 mb-0.5">종료일</div>
          {endDate ? format(new Date(endDate), 'M월 d일 (E)', { locale: ko }) : '선택'}
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold">{format(currentMonth, 'yyyy년 M월', { locale: ko })}</span>
        <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="space-y-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((d, di) => {
              const inMonth = isSameMonth(d, currentMonth);
              const selected = isStart(d) || isEnd(d);
              const inRange = isInRange(d);
              return (
                <button
                  key={di}
                  type="button"
                  onClick={() => handleDayClick(d)}
                  className={`relative h-9 text-sm rounded-lg transition-colors ${
                    !inMonth ? 'text-gray-300' :
                    selected ? 'bg-navy text-white font-semibold' :
                    inRange ? 'bg-accent text-navy' :
                    'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Duration info */}
      {start && end && (
        <div className="mt-3 text-center text-xs text-gray-500">
          {Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1}일간의 여행
        </div>
      )}
    </div>
  );
}
