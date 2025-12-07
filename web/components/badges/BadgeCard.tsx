'use client';

import { LucideIcon, Award, BookOpen, Compass, Crown, Feather, MessageCircle, Pencil, Target, Trophy, Zap, ClipboardCheck, Star, MessagesSquare, Lock } from 'lucide-react';

interface BadgeCardProps {
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  locked?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  'pencil': Pencil,
  'book': BookOpen,
  'feather': Feather,
  'message-circle': MessageCircle,
  'messages': MessagesSquare,
  'trophy': Trophy,
  'award': Award,
  'clipboard-check': ClipboardCheck,
  'compass': Compass,
  'target': Target,
  'zap': Zap,
  'crown': Crown,
  'star': Star
};

export function BadgeCard({ name, description, icon, earnedAt, locked }: BadgeCardProps) {
  const IconComponent = iconMap[icon] || Star;
  
  return (
    <div className={`relative flex flex-col items-center p-4 rounded-lg border ${locked ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'}`}>
      {locked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${locked ? 'bg-gray-200' : 'bg-gradient-to-br from-amber-400 to-yellow-500'}`}>
        <IconComponent className={`w-6 h-6 ${locked ? 'text-gray-400' : 'text-white'}`} />
      </div>
      <h3 className={`mt-2 text-sm font-semibold text-center ${locked ? 'text-gray-500' : 'text-gray-800'}`}>{name}</h3>
      <p className="text-xs text-gray-500 text-center mt-1">{description}</p>
      {earnedAt && !locked && (
        <p className="text-xs text-amber-600 mt-2">
          Earned {new Date(earnedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
