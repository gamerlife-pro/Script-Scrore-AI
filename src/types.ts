export type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk';

export interface HookMetrics {
  strength: number;
  curiosity: number;
  emotionalTrigger: number;
}

export interface RetentionSegment {
  name: 'Intro' | 'Problem' | 'Main Content' | 'Solution' | 'CTA';
  risk: RiskLevel;
  explanation: string;
}

export interface StorytellingMetrics {
  setup: number;
  conflict: number;
  resolution: number;
  pacing: number;
}

export interface ReadabilityMetrics {
  readingLevel: string;
  sentenceLength: string;
  passiveVoice: string;
  complexityScore: string;
}

export interface EngagementMetrics {
  curiosity: number;
  emotionalImpact: number;
  authority: number;
  entertainment: number;
}

export interface ScriptSegmentHighlight {
  text: string;
  type: 'strong' | 'average' | 'drop-off';
  comment: string;
}

export interface AnalysisResult {
  overallScore: number;
  viralPotential: 'High' | 'Medium' | 'Low';
  retentionScore: number;
  clarityScore: number;
  hook: HookMetrics;
  retention: RetentionSegment[];
  storytelling: StorytellingMetrics;
  readability: ReadabilityMetrics;
  engagement: EngagementMetrics;
  suggestions: string[];
  scriptHighlights: ScriptSegmentHighlight[];
  wordCount: number;
  estimatedDuration: string; // e.g., "5:12"
}
