export const FILTERS = [
  { id: 'none', name: 'Normal', style: 'none', thumbnail: 'bg-gray-600' },
  { id: 'vivid', name: 'Vivid', style: 'saturate(1.4) contrast(1.1)', thumbnail: 'bg-pink-500' },
  { id: 'warm', name: 'Warm', style: 'sepia(0.3) saturate(1.2) brightness(1.05)', thumbnail: 'bg-orange-500' },
  { id: 'cool', name: 'Cool', style: 'hue-rotate(-15deg) saturate(1.1) brightness(1.05)', thumbnail: 'bg-blue-500' },
  { id: 'vintage', name: 'Vintage', style: 'sepia(0.5) contrast(1.1) brightness(0.95)', thumbnail: 'bg-amber-700' },
  { id: 'noir', name: 'B&W', style: 'grayscale(1) contrast(1.2)', thumbnail: 'bg-gray-800' },
  { id: 'dramatic', name: 'Dramatic', style: 'contrast(1.3) saturate(1.2) brightness(0.9)', thumbnail: 'bg-slate-700' },
  { id: 'fade', name: 'Fade', style: 'contrast(0.9) saturate(0.8) brightness(1.1)', thumbnail: 'bg-stone-400' },
] as const;

export const FACE_FILTERS = [
  { id: 'none', emoji: '❌', name: 'None', overlay: null },
  { id: 'glasses', emoji: '👓', name: 'Glasses', overlay: 'glasses' },
  { id: 'sunglasses', emoji: '🕶️', name: 'Sunglasses', overlay: 'sunglasses' },
  { id: 'crown', emoji: '👑', name: 'Crown', overlay: 'crown' },
  { id: 'cat', emoji: '😺', name: 'Cat Ears', overlay: 'cat' },
  { id: 'dog', emoji: '🐶', name: 'Dog Ears', overlay: 'dog' },
  { id: 'sparkle', emoji: '✨', name: 'Sparkle', overlay: 'sparkle' },
  { id: 'hearts', emoji: '💖', name: 'Hearts', overlay: 'hearts' },
  { id: 'fire', emoji: '🔥', name: 'Fire', overlay: 'fire' },
  { id: 'butterfly', emoji: '🦋', name: 'Butterfly', overlay: 'butterfly' },
] as const;

export const BACKGROUNDS = [
  { id: 'none', emoji: '❌', name: 'None' },
  { id: 'blur', emoji: '🌀', name: 'Blur' },
  { id: 'beach', emoji: '🏖️', name: 'Beach', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'space', emoji: '🚀', name: 'Space', gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 'sunset', emoji: '🌅', name: 'Sunset', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)' },
  { id: 'nature', emoji: '🌲', name: 'Nature', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'neon', emoji: '💜', name: 'Neon', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
] as const;

export const LAYERS = [
  { id: 'environment', label: 'Environment', emoji: '🌍', color: 'from-emerald-500 to-green-600' },
  { id: 'bio', label: 'Biological', emoji: '🧬', color: 'from-rose-500 to-pink-600' },
  { id: 'internal', label: 'Internal', emoji: '🧠', color: 'from-purple-500 to-violet-600' },
  { id: 'cultural', label: 'Cultural', emoji: '🎭', color: 'from-amber-500 to-orange-600' },
  { id: 'social', label: 'Social', emoji: '👥', color: 'from-blue-500 to-cyan-600' },
  { id: 'conscious', label: 'Conscious', emoji: '💭', color: 'from-teal-500 to-blue-600' },
  { id: 'existential', label: 'Existential', emoji: '✨', color: 'from-violet-500 to-purple-600' },
] as const;

export const STYLES = [
  { id: 'normal', name: 'Normal' },
  { id: 'anime', name: 'Anime' },
  { id: 'oil', name: 'Oil Painting' },
  { id: 'sketch', name: 'Sketch' },
  { id: 'pixel', name: 'Pixel Art' },
] as const;

export const TIMER_OPTIONS = [0, 3, 5, 10] as const;

export const MAX_VIDEO_DURATION = 60;

export type FilterId = typeof FILTERS[number]['id'];
export type FaceFilterId = typeof FACE_FILTERS[number]['id'];
export type BackgroundId = typeof BACKGROUNDS[number]['id'];
export type LayerId = typeof LAYERS[number]['id'];
