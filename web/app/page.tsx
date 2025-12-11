'use client';

import { useState, useEffect, useCallback } from 'react';
import VerticalVideoFeed from '@/components/feed/VerticalVideoFeed';
import CategoryTabs from '@/components/feed/CategoryTabs';
import FloatingCreateButton from '@/components/ui/FloatingCreateButton';

export default function Home() {
  const [category, setCategory] = useState('for-you');
  const [userLayerScores, setUserLayerScores] = useState<Record<string, number> | undefined>();
  const [isUIVisible, setIsUIVisible] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('demo_user_id');

    const fetchUserAssessment = async () => {
      try {
        if (!storedUserId) return;

        const res = await fetch(`/api/assessments?userId=${storedUserId}`);
        const data = await res.json();
        
        if (data.assessments && data.assessments.length > 0) {
          const latestAssessment = data.assessments[0];
          setUserLayerScores(latestAssessment.layerScores);
        }
      } catch (error) {
        console.error('Failed to fetch user assessment:', error);
      }
    };

    fetchUserAssessment();
  }, []);

  const handleVideoChange = useCallback((isScrolling: boolean) => {
    setIsUIVisible(!isScrolling);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <CategoryTabs
        activeCategory={category}
        onCategoryChange={setCategory}
        variant="overlay"
        isVisible={isUIVisible}
      />
      <VerticalVideoFeed
        category={category}
        userLayerScores={userLayerScores}
        onVideoChange={handleVideoChange}
      />
      <FloatingCreateButton isVisible={isUIVisible} />
    </div>
  );
}
