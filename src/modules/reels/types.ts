// انواع مشترک موتور Reel Orchestration

export type ReelMode = 'ai' | 'scripted' | 'hybrid';
export type SegmentPurpose = 'hook' | 'problem' | 'context' | 'value' | 'solution' | 'proof' | 'cta';

// قوانین پیوستگی بصری (Continuity Engine)
export interface ContinuityRules {
  colorPalette: string[];
  lighting: string;
  mood: string;
  cameraLanguage: string;
  aspectRatio: string;
  styleKeywords: string[];
  avoid: string[];
}

// یک بخش (segment) ۵ ثانیه‌ای
export interface ReelSegment {
  index: number;
  start: number;
  end: number;
  purpose: SegmentPurpose;
  scene: string;            // توصیف صحنه (انگلیسی برای مدل تصویر)
  imagePrompt: string;      // پرامپت نهایی تصویر (با continuity)
  negativePrompt: string;
  motion: string;           // slow_zoom_in, parallax_up, pan_left...
  overlayText: string;      // متن فارسی روی تصویر (render در UI/FFmpeg)
  highlightWord: string;
  voiceover: string;
  transitionOut: string;    // punch_cut, soft_dissolve, beat_sync, fade_out
  imageUrl?: string;        // keyframe تولیدشده
}

// blueprint کلی
export interface ReelPlan {
  topic: string;
  duration: number;
  style: string;
  audience: string;
  hook: string;
  continuity: ContinuityRules;
  segmentCount: number;
}

// پیشنهادهای AI برای مرحله Selection
export interface MusicOption {
  id: string; label: string;
  mood: 'energetic' | 'luxury' | 'soft' | 'dramatic' | 'educational';
  bpm: number; intensity: number;
  recommendedTransitions: string[]; textAnimationStyle: string;
}
export interface EditingStyleOption { id: string; label: string; pace: string; description: string }
export interface ReelSuggestions {
  hooks: string[];
  ctas: string[];
  overlayVariants: string[];
  musicOptions: MusicOption[];
  editingStyles: EditingStyleOption[];
}

// انتخاب کاربر (Pre-Render Approval)
export interface ReelSelections {
  selectedHook?: string;
  selectedCta?: string;
  selectedMusicId?: string;
  selectedEditingStyleId?: string;
  customTexts?: { index: number; text: string }[];
  segmentOrder?: number[];
}

// خروجی نهایی timeline برای render
export interface FinalScript {
  duration: number;
  aspectRatio: string;
  music: { id: string; mood: string; bpm: number };
  editingStyle: string;
  segments: {
    index: number; start: number; end: number;
    imageUrl: string; motion: string;
    text: string; highlightWord: string;
    transition: string;
  }[];
  captions: { text: string; hashtags: string[] };
  cta: string;
}

// خروجی QA
export interface ReelQA {
  passed: boolean;
  checks: { label: string; ok: boolean }[];
  warnings: string[];
}
