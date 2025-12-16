'use client';

interface LevelInfo {
  level: number;
  name: string;
  minScore: number;
  maxScore: number;
  progress: number;
}

interface LevelDisplayProps {
  score: number;
}

function getLevel(score: number): LevelInfo {
  const levels = [
    { level: 1, name: 'Novice', minScore: 0, maxScore: 50 },
    { level: 2, name: 'Explorer', minScore: 51, maxScore: 200 },
    { level: 3, name: 'Practitioner', minScore: 201, maxScore: 500 },
    { level: 4, name: 'Adept', minScore: 501, maxScore: 1000 },
    { level: 5, name: 'Master', minScore: 1001, maxScore: Infinity }
  ];

  for (const levelInfo of levels) {
    if (score >= levelInfo.minScore && score <= levelInfo.maxScore) {
      const range = levelInfo.maxScore === Infinity ? 1000 : levelInfo.maxScore - levelInfo.minScore;
      const progress = Math.min(((score - levelInfo.minScore) / range) * 100, 100);
      return { ...levelInfo, progress: Math.round(progress) };
    }
  }

  return { level: 1, name: 'Novice', minScore: 0, maxScore: 50, progress: 0 };
}

const levelColors: Record<number, { bg: string; text: string; bar: string }> = {
  1: { bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-400' },
  2: { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
  3: { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-500' },
  4: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
  5: { bg: 'bg-gradient-to-r from-green-100 to-yellow-100', text: 'text-green-800', bar: 'bg-gradient-to-r from-green-500 to-yellow-500' }
};

export function LevelDisplay({ score }: LevelDisplayProps) {
  const levelInfo = getLevel(score);
  const colors = levelColors[levelInfo.level];
  const nextLevel = levelInfo.level < 5 ? levelInfo.maxScore : null;

  return (
    <div className={`p-4 rounded-lg ${colors.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors.bar} text-white font-bold text-sm`}>
            {levelInfo.level}
          </div>
          <span className={`font-semibold ${colors.text}`}>{levelInfo.name}</span>
        </div>
        <span className={`text-lg font-bold ${colors.text}`}>{Math.round(score)} pts</span>
      </div>
      
      <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${levelInfo.progress}%` }}
        />
      </div>
      
      {nextLevel && (
        <p className="text-xs text-gray-600 mt-2 text-right">
          {nextLevel - score} points to next level
        </p>
      )}
    </div>
  );
}
