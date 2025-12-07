"use client";
import React, {useState, useEffect} from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

const layers = [
  {
    id: 'environment',
    name: 'Environment',
    emoji: '🌍',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Your physical and digital surroundings - workspace, home, tools, and algorithms that shape your daily experience.',
    questions: [
      'How organized and functional is your physical space?',
      'Do your digital tools help or hinder your productivity?',
      'Is your environment aligned with your goals?'
    ]
  },
  {
    id: 'bio',
    name: 'Bio',
    emoji: '💪',
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'Your physical health foundation - sleep quality, nutrition, exercise, and overall bodily wellness.',
    questions: [
      'How would you rate your sleep quality and energy levels?',
      'Are you nourishing your body with proper nutrition?',
      'Do you maintain regular physical activity?'
    ]
  },
  {
    id: 'internal',
    name: 'Internal',
    emoji: '🧠',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Your inner landscape - beliefs, cognitive patterns, emotional regulation, and past experiences that influence behavior.',
    questions: [
      'How well do you understand your emotional triggers?',
      'Are your beliefs supporting or limiting your growth?',
      'How effectively do you manage stress and anxiety?'
    ]
  },
  {
    id: 'cultural',
    name: 'Cultural',
    emoji: '🎭',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'The shared values, norms, and programming from your cultural background that shape your worldview.',
    questions: [
      'How aware are you of cultural influences on your thinking?',
      'Do cultural norms align with your personal values?',
      'How open are you to different cultural perspectives?'
    ]
  },
  {
    id: 'social',
    name: 'Social',
    emoji: '🤝',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Your relationships and connections - family, friends, colleagues, and the quality of your daily interactions.',
    questions: [
      'How fulfilling are your close relationships?',
      'Do you feel supported by your community?',
      'How effective is your communication with others?'
    ]
  },
  {
    id: 'conscious',
    name: 'Conscious',
    emoji: '✨',
    color: 'from-cyan-500 to-teal-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    description: 'Your metacognition and awareness - ability to observe thoughts, set intentions, and align with collective wisdom.',
    questions: [
      'How present and mindful are you in daily life?',
      'Can you observe your thoughts without judgment?',
      'How aligned are your actions with your intentions?'
    ]
  },
  {
    id: 'existential',
    name: 'Existential',
    emoji: '🌟',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Your sense of purpose and meaning - legacy, contribution, and connection to something greater than yourself.',
    questions: [
      'How clear is your sense of life purpose?',
      'Do you feel you are making a meaningful contribution?',
      'How connected do you feel to something greater?'
    ]
  }
] as const;

type LayerId = typeof layers[number]['id'];

export default function AssessmentForm() {
  const initial: Record<LayerId, number> = {} as Record<LayerId, number>;
  layers.forEach((l) => (initial[l.id] = 5));

  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<LayerId, number>>(initial);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{score: number; id: string} | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('demo_user_id');
    setUserId(storedUserId);
  }, []);

  const currentLayer = layers[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === layers.length - 1;

  function setLayerValue(layer: LayerId, v: number) {
    setValues((s) => ({...s, [layer]: v}));
  }

  function nextStep() {
    if (currentStep < layers.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function goToStep(step: number) {
    setCurrentStep(step);
  }

  async function handleSubmit() {
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch('/api/assessments', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({layer_scores: values, user_id: userId})
      });
      const data = await resp.json();
      if (resp.ok) {
        setResult({score: data.overall_score ?? 0, id: data.id});
        setShowResults(true);
      } else {
        console.error(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function resetAssessment() {
    setCurrentStep(0);
    setValues(initial);
    setResult(null);
    setShowResults(false);
  }

  const averageScore = Object.values(values).reduce((a, b) => a + b, 0) / layers.length;

  if (showResults && result) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center p-8">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
              {result.score.toFixed(1)}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
            <p className="text-gray-600">Your Akorfa Score has been calculated</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {layers.map((layer) => (
              <div key={layer.id} className={`p-3 rounded-lg ${layer.bgColor} ${layer.borderColor} border`}>
                <div className="text-2xl mb-1">{layer.emoji}</div>
                <div className="text-xs text-gray-600 capitalize">{layer.name}</div>
                <div className="font-bold text-gray-900">{values[layer.id]}/10</div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Average Layer Score</div>
            <div className="text-3xl font-bold text-gray-900">{averageScore.toFixed(1)}</div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={resetAssessment} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
              Take Another Assessment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {layers.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / layers.length) * 100)}% complete
          </span>
        </div>
        
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300 ease-out"
            style={{width: `${((currentStep + 1) / layers.length) * 100}%`}}
          />
        </div>

        <div className="flex justify-between">
          {layers.map((layer, index) => (
            <button
              key={layer.id}
              onClick={() => goToStep(index)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg
                transition-all duration-200 cursor-pointer
                ${index === currentStep 
                  ? `bg-gradient-to-br ${layer.color} text-white shadow-lg scale-110` 
                  : index < currentStep
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-400'
                }
              `}
              title={layer.name}
            >
              {layer.emoji}
            </button>
          ))}
        </div>
      </div>

      <Card className={`${currentLayer.bgColor} ${currentLayer.borderColor} border-2 p-6 mb-6`}>
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${currentLayer.color} text-white text-3xl mb-3`}>
            {currentLayer.emoji}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 capitalize">{currentLayer.name}</h2>
          <p className="text-gray-600 mt-2">{currentLayer.description}</p>
        </div>

        <div className="bg-white/70 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Consider these questions:</h3>
          <ul className="space-y-2">
            {currentLayer.questions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-gray-400">•</span>
                {q}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="font-medium text-gray-900">Rate this layer</label>
            <div className={`text-2xl font-bold bg-gradient-to-r ${currentLayer.color} bg-clip-text text-transparent`}>
              {values[currentLayer.id]}/10
            </div>
          </div>

          <div className="relative mb-4">
            <input
              aria-label={`${currentLayer.name} score`}
              type="range"
              min={0}
              max={10}
              value={values[currentLayer.id]}
              onChange={(e) => setLayerValue(currentLayer.id, Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Needs work</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            {[0, 2, 4, 6, 8, 10].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setLayerValue(currentLayer.id, v)}
                className={`
                  w-10 h-10 rounded-lg text-sm font-medium transition-all
                  ${values[currentLayer.id] === v
                    ? `bg-gradient-to-br ${currentLayer.color} text-white shadow-md`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          onClick={prevStep}
          disabled={isFirstStep}
          className={isFirstStep ? 'opacity-0 pointer-events-none' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
        >
          ← Previous
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-500 hover:to-secondary-400"
          >
            {loading ? 'Calculating...' : 'Complete Assessment ✓'}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={nextStep}
            className="bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-500 hover:to-secondary-400"
          >
            Next →
          </Button>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-2">Current Progress</div>
        <div className="flex gap-1">
          {layers.map((layer, index) => (
            <div
              key={layer.id}
              className={`
                flex-1 h-8 rounded flex items-center justify-center text-xs
                ${index <= currentStep 
                  ? `bg-gradient-to-br ${layer.color} text-white` 
                  : 'bg-gray-200 text-gray-400'
                }
              `}
              title={`${layer.name}: ${values[layer.id]}/10`}
            >
              {values[layer.id]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
