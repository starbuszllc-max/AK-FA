'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, BookOpen, Zap, Share2, Check, ChevronRight, 
  Sparkles, Brain, Heart, Users, Leaf, Star, ArrowRight,
  X, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface DailyFlowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: string;
  href?: string;
  completed: boolean;
}

interface DailyFlowProps {
  userId: string;
  onClose?: () => void;
}

export default function DailyFlow({ userId, onClose }: DailyFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<DailyFlowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestedContent, setSuggestedContent] = useState<any>(null);
  const [suggestedChallenge, setSuggestedChallenge] = useState<any>(null);
  const [focusLayer, setFocusLayer] = useState<string>('');

  useEffect(() => {
    initializeFlow();
  }, [userId]);

  const initializeFlow = async () => {
    try {
      const assessmentRes = await fetch(`/api/assessments?userId=${userId}`);
      let lowestLayer = 'social';
      let hasRecentAssessment = false;

      if (assessmentRes.ok) {
        const data = await assessmentRes.json();
        if (data.assessments && data.assessments.length > 0) {
          const latest = data.assessments[0];
          const createdAt = new Date(latest.createdAt || latest.created_at);
          const daysSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          hasRecentAssessment = daysSince < 7;

          const scores = latest.layerScores || latest.layer_scores || {};
          let minScore = 100;
          Object.entries(scores).forEach(([layer, score]) => {
            if (typeof score === 'number' && score < minScore) {
              minScore = score;
              lowestLayer = layer;
            }
          });
        }
      }

      setFocusLayer(lowestLayer);

      const initialSteps: DailyFlowStep[] = [
        {
          id: 'assess',
          title: 'Check In',
          description: hasRecentAssessment 
            ? 'Your assessment is up to date!' 
            : 'Take a quick assessment to understand your current state',
          icon: <Target className="w-6 h-6" />,
          color: 'from-indigo-500 to-purple-500',
          action: hasRecentAssessment ? 'View Results' : 'Start Assessment',
          href: '/assessments',
          completed: hasRecentAssessment
        },
        {
          id: 'learn',
          title: 'Learn & Grow',
          description: `Content tailored for your ${lowestLayer} layer`,
          icon: <BookOpen className="w-6 h-6" />,
          color: 'from-blue-500 to-cyan-500',
          action: 'Explore Content',
          href: `/feed?layer=${lowestLayer}`,
          completed: false
        },
        {
          id: 'act',
          title: 'Take Action',
          description: 'Complete a challenge to boost your score',
          icon: <Zap className="w-6 h-6" />,
          color: 'from-orange-500 to-red-500',
          action: 'Start Challenge',
          href: '/daily-challenges',
          completed: false
        },
        {
          id: 'share',
          title: 'Share & Inspire',
          description: 'Share your journey and inspire others',
          icon: <Share2 className="w-6 h-6" />,
          color: 'from-green-500 to-emerald-500',
          action: 'Create Post',
          href: '/create',
          completed: false
        }
      ];

      setSteps(initialSteps);

      const completedCount = initialSteps.filter(s => s.completed).length;
      setCurrentStep(Math.min(completedCount, initialSteps.length - 1));

      fetchSuggestions(lowestLayer);
    } catch (error) {
      console.error('Failed to initialize daily flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (layer: string) => {
    try {
      const [contentRes, challengeRes] = await Promise.all([
        fetch(`/api/posts?layer=${layer}&limit=3`),
        fetch(`/api/daily-challenges?layer=${layer}`)
      ]);

      if (contentRes.ok) {
        const data = await contentRes.json();
        if (data.posts && data.posts.length > 0) {
          setSuggestedContent(data.posts[0]);
        }
      }

      if (challengeRes.ok) {
        const data = await challengeRes.json();
        if (data.challenges && data.challenges.length > 0) {
          setSuggestedChallenge(data.challenges[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const markStepComplete = (stepId: string) => {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, completed: true } : s
    ));
    
    const nextIncomplete = steps.findIndex(s => s.id !== stepId && !s.completed);
    if (nextIncomplete !== -1) {
      setCurrentStep(nextIncomplete);
    }
  };

  const getLayerIcon = (layer: string) => {
    const icons: Record<string, React.ReactNode> = {
      environment: <Leaf className="w-4 h-4" />,
      bio: <Heart className="w-4 h-4" />,
      internal: <Brain className="w-4 h-4" />,
      cultural: <Star className="w-4 h-4" />,
      social: <Users className="w-4 h-4" />,
      conscious: <Zap className="w-4 h-4" />,
      existential: <Sparkles className="w-4 h-4" />,
    };
    return icons[layer] || <Target className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Your Daily Journey</h2>
            <p className="text-white/80 text-sm">
              {steps.filter(s => s.completed).length} of {steps.length} steps complete
            </p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {steps.map((step, idx) => (
            <div 
              key={step.id}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                step.completed 
                  ? 'bg-white' 
                  : idx === currentStep 
                    ? 'bg-white/60' 
                    : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {focusLayer && (
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white">
              {getLayerIcon(focusLayer)}
            </div>
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Today's focus: </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                {focusLayer} Layer
              </span>
            </div>
          </div>
        )}

        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative rounded-xl border transition-all ${
              step.completed 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : idx === currentStep 
                  ? 'bg-white dark:bg-slate-700 border-indigo-300 dark:border-indigo-600 shadow-lg' 
                  : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 opacity-60'
            }`}
          >
            <div className="p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-500' 
                  : `bg-gradient-to-br ${step.color}`
              } text-white shadow-lg`}>
                {step.completed ? <Check className="w-6 h-6" /> : step.icon}
              </div>

              <div className="flex-1">
                <h3 className={`font-semibold ${
                  step.completed 
                    ? 'text-green-700 dark:text-green-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>

              {step.completed ? (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : idx === currentStep && step.href ? (
                <Link
                  href={step.href}
                  onClick={() => markStepComplete(step.id)}
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/25"
                >
                  {step.action}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {idx === currentStep && step.id === 'learn' && suggestedContent && (
              <div className="px-4 pb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Suggested for you
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {suggestedContent.content}
                  </p>
                </div>
              </div>
            )}

            {idx === currentStep && step.id === 'act' && suggestedChallenge && (
              <div className="px-4 pb-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
                    Today's challenge
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {suggestedChallenge.title || suggestedChallenge.name}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        <button 
          onClick={() => initializeFlow()}
          className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Refresh suggestions</span>
        </button>
      </div>
    </div>
  );
}
