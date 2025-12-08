'use client';

import { useState, useEffect } from 'react';
import { Flame, Calendar, Trophy, TrendingUp } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  activityDates: string[];
}

interface StreakCalendarProps {
  userId: string;
  className?: string;
}

export default function StreakCalendar({ userId, className = '' }: StreakCalendarProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    fetchStreakData();
  }, [userId]);

  const fetchStreakData = async () => {
    try {
      const res = await fetch(`/api/streaks?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setStreakData(data);
      }
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isActivityDay = (day: number) => {
    if (!streakData?.activityDates) return false;
    const dateStr = formatDateString(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      day
    );
    return streakData.activityDates.includes(dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedMonth.getMonth() === today.getMonth() &&
      selectedMonth.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: number) => {
    const now = new Date();
    const minDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const maxDate = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const newDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + direction, 1);
    
    if (newDate >= minDate && newDate <= maxDate) {
      setSelectedMonth(newDate);
    }
  };

  const canNavigateBack = () => {
    const now = new Date();
    const minDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const prevMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
    return prevMonth >= minDate;
  };

  const canNavigateForward = () => {
    const now = new Date();
    const maxDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
    return nextMonth <= maxDate;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const hasActivity = isActivityDay(day);
      const isTodayDate = isToday(day);

      days.push(
        <div
          key={day}
          className={`w-8 h-8 flex items-center justify-center text-xs rounded-full transition-all ${
            hasActivity
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-md'
              : isTodayDate
              ? 'border-2 border-purple-500 dark:border-purple-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {hasActivity ? <Flame className="w-4 h-4" /> : day}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Activity Streak</h3>
            <p className="text-white/80 text-sm">Keep the fire burning!</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {streakData?.currentStreak || 0}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Current Streak</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-5 h-5 text-purple-500" />
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {streakData?.longestStreak || 0}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Longest Streak</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigateMonth(-1)}
            disabled={!canNavigateBack()}
            className={`p-1.5 rounded-lg transition-colors ${
              canNavigateBack() 
                ? 'hover:bg-gray-100 dark:hover:bg-slate-700' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            disabled={!canNavigateForward()}
            className={`p-1.5 rounded-lg transition-colors ${
              canNavigateForward() 
                ? 'hover:bg-gray-100 dark:hover:bg-slate-700' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="w-8 h-6 flex items-center justify-center text-xs font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Flame className="w-2.5 h-2.5 text-white" />
              </div>
              <span>= Active day</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Keep going!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
