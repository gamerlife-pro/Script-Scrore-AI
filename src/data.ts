import { AnalysisResult, ScriptSegmentHighlight, RetentionSegment, RiskLevel } from './types';

// Predefined pools of highly actionable YouTube script suggestions
const HIGH_SCORE_SUGGESTIONS = [
  "Excellent narrative momentum. Keep the pacing tight in the middle section during recording.",
  "Your hook is extremely clear. Ensure your display graphics match the keyword 'mystery' mentioned in the first 10 seconds.",
  "Consider inserting a visual patterns break (e.g. a B-roll loop or screen zoom) at the transition to your main case study.",
  "Your CTA is focused on one single action—this is ideal. Avoid mentioning social handles until the very end."
];

const AVERAGE_SCORE_SUGGESTIONS = [
  "Your hook reveals the core answer too early. Try to build curiosity and delay the absolute resolution until the climax.",
  "Add a stronger emotional trigger in the first 30 seconds to hook viewers who clicked for the concept.",
  "Shorten paragraphs 3 and 4. Reading multiple consecutive long sentences might cause visual fatigue and slow down your delivery.",
  "Increase curiosity before the main reveal by using an open loop statement (e.g., 'But what they didn't know would change everything').",
  "The Transition from the Problem to the Main Content feels abrupt. Use a verbal bridge like 'This is exactly why...' to keep viewers locked.",
  "You mention three different actions in your CTA. Stick to standard single CTA: direct them to the next recommended video."
];

const LOW_SCORE_SUGGESTIONS = [
  "The hook lacks a direct reader benefit or a curiosity element. Start with a vivid scenario or a surprising truth instead of an introduction of who you are.",
  "The problem statement is buried. The first 45 seconds should actively amplify why this topic matters to the viewer's immediate life or curiosity.",
  "Large chunks of theoretical explanation are present. Break this up using real-world analogies, stories, or dynamic B-roll prompts.",
  "Delivery pace is projected to drag. Remove filler phrases like 'In this video, I'm going to show you' and jump straight into action.",
  "No strong open loops. Introduce elements that will be solved 'later in the video' to preserve second-half retention.",
  "We weak CTA. Instead of asking to 'like, comment, and subscribe', pitch them directly on clicking the next video to continue their journey."
];

const MOCK_SCRIPTS = [
  {
    title: "How I Built a SaaS in 24 Hours with AI",
    text: `It was 2 AM, and I had exactly zero lines of code written. I had promised my subscribers I would launch a fully functional SaaS company in 24 hours, or I would delete my channel. The pressure was intense, and my heart was racing.

Here was the problem: I'm not a senior developer, and building a subscription payments gateway normally takes weeks. Every tutorial I found online was six hours long and completely outdated. I was stuck, exhausted, and ready to give up.

Then, I decided to try a controversial shortcut. Instead of writing the code, I used a brand-new AI agent to build the backend database, authentication, and layout logic.

Here is exactly how it worked: Step one was defining the database schema using simple text prompts. Within minutes, the AI had constructed a robust relational scheme and set up simulated user profiles.

Next was the frontend. I asked the AI to build a dashboard inspired by Linear and Stripe, complete with dark-mode utility styling. It compiled perfectly on the first try.

With just 2 hours left before the deadline, I connected the final APIs, pushed to production, and launched on Product Hunt. The result? We hit number three product of the day and made $1,200 in recurring revenue in the first afternoon.

If you want to learn how to clone this exact AI setup for your own projects, watch this next video where I break down the exact prompts I used. See you there.`
  },
  {
    title: "The Insane Psychology of Luxury Brands",
    text: `Why would anyone pay $12,000 for a leather bag that costs $50 to manufacture? It makes absolutely no logical sense. Yet, millions of people queue up outside luxury boutiques every single day. 

The secret lies in a devious psychological principle called the "Veblen effect." Most products lose demand when the price rises. Luxury items do the exact opposite.

The trouble starts when fast-fashion brands try to copy this. They increase their prices, but instead of looking luxury, they look greedy. Why? Because they lack the critical status signaling.

To understand this, we have to look at how luxury brands cultivate artificial scarcity. Hermes doesn't just make bags; they deliberately restrict production and require customers to develop a relationships history with sales associates first.

This turns a simple purchase into a high-stakes conquest. The bag is no longer a tool for carrying keys; it's a social emblem showing you belong to an exclusive tribe.

When you buy luxury, you aren't paying for raw materials. You are buying high-fidelity social credit.

If you found this breakdown of consumer behavior fascinating, hit the subscribe button. We release new deep-dives into psychological tricks every single Thursday.`
  }
];

export function getMockScripts() {
  return MOCK_SCRIPTS;
}

export function analyzeScriptText(text: string): AnalysisResult {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  
  // Calculate estimated speaking duration (average 150 words per minute)
  const totalSeconds = Math.max(10, Math.round((wordCount / 150) * 60));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const estimatedDuration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  // Generate semi-randomized but balanced scores
  // (we make them slightly dependent on the script length to reward standard video structure)
  const lengthFactor = Math.min(10, Math.floor(wordCount / 100)); // up to +10 bonus for longer/fuller scripts
  const overallScore = Math.min(98, Math.max(55, 72 + Math.floor(Math.random() * 12) + lengthFactor));
  const retentionScore = Math.min(97, Math.max(50, overallScore - 4 + Math.floor(Math.random() * 8)));
  const clarityScore = Math.min(99, Math.max(65, 78 + Math.floor(Math.random() * 15)));
  
  let viralPotential: 'High' | 'Medium' | 'Low' = 'Medium';
  if (overallScore > 85) viralPotential = 'High';
  else if (overallScore < 70) viralPotential = 'Low';

  // Hook metrics
  const hookStrength = Math.min(100, Math.max(45, 68 + Math.floor(Math.random() * 20) + (text.includes("?") || text.includes("!") ? 8 : 0)));
  const curiosity = Math.min(100, Math.max(40, 60 + Math.floor(Math.random() * 25)));
  const emotionalTrigger = Math.min(100, Math.max(35, 55 + Math.floor(Math.random() * 30)));

  // Storytelling metrics
  const setup = Math.min(100, Math.max(50, 70 + Math.floor(Math.random() * 20)));
  const conflict = Math.min(100, Math.max(45, 65 + Math.floor(Math.random() * 25)));
  const resolution = Math.min(100, Math.max(55, 75 + Math.floor(Math.random() * 18)));
  const pacing = Math.min(100, Math.max(40, 60 + Math.floor(Math.random() * 25)));

  // Readability
  const readabilityLevels = ["7th Grade", "8th Grade", "9th Grade", "High School", "College Level"];
  const readingLevel = readabilityLevels[Math.min(readabilityLevels.length - 1, Math.max(0, Math.floor(wordCount / 120)))];
  const sentenceLength = `${(10 + Math.random() * 8).toFixed(1)} words avg`;
  const passiveVoice = `${(5 + Math.floor(Math.random() * 15))}%`;
  const complexityScore = overallScore > 85 ? 'Optimized' : (overallScore > 70 ? 'Moderate' : 'High Complexity');

  // Engagement Metrics
  const engCuriosity = Math.min(100, Math.max(50, 65 + Math.floor(Math.random() * 25)));
  const engEmotion = Math.min(100, Math.max(40, 58 + Math.floor(Math.random() * 30)));
  const engAuthority = Math.min(100, Math.max(45, 70 + Math.floor(Math.random() * 20)));
  const engEntertainment = Math.min(100, Math.max(40, 62 + Math.floor(Math.random() * 25)));

  // Generate Dynamic Suggestions depending on overall score
  let suggestionsPool = AVERAGE_SCORE_SUGGESTIONS;
  if (overallScore >= 85) {
    suggestionsPool = [...HIGH_SCORE_SUGGESTIONS, ...AVERAGE_SCORE_SUGGESTIONS.slice(0, 2)];
  } else if (overallScore < 72) {
    suggestionsPool = [...LOW_SCORE_SUGGESTIONS, ...AVERAGE_SCORE_SUGGESTIONS.slice(-2)];
  }

  // Shuffle & Pick 4 suggestions
  const suggestions = [...suggestionsPool]
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  // Generate script highlights dynamically based on actual paragraphs
  const paragraphs = text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const scriptHighlights: ScriptSegmentHighlight[] = [];
  const retentionSegments: RetentionSegment[] = [];

  const segmentKeys: ('Intro' | 'Problem' | 'Main Content' | 'Solution' | 'CTA')[] = [
    'Intro', 'Problem', 'Main Content', 'Solution', 'CTA'
  ];

  const segmentRiskExplanations = {
    'Intro': {
      'Low Risk': "Hook is robust and rapidly states the core conflict or curiosity angle, preventing early swipes.",
      'Medium Risk': "Slightly slow introduction of the subject matter. Trim 2-3 filler words inside the first paragraph.",
      'High Risk': "The video begins with channel greetings or administrative talk. Try to jump directly into the core promise."
    },
    'Problem': {
      'Low Risk': "Problem statement is clear, relatable, and amplifies the pain point of the audience beautifully.",
      'Medium Risk': "The problem is specified, but viewers might lose relative connection. Highlight immediate stakes.",
      'High Risk': "No clear conflict presented. Viewers won't understand why they should care."
    },
    'Main Content': {
      'Low Risk': "Excellent flow. Paragraphs are reasonably short and provide continuous value or curiosity upgrades.",
      'Medium Risk': "Paragraph flow is steady, but blocky syntax might slow your live speaking pace.",
      'High Risk': "High density of passive phrases that dilute narrative punch. Pacing risks drop-off."
    },
    'Solution': {
      'Low Risk': "Satisfying payoff with clean, conversational tone that validates the viewer's investment of time.",
      'Medium Risk': "The solution is good, but lacks actionable visual support suggestions.",
      'High Risk': "Solution feels hurried or inconclusive. Viewers might feel unsatisfied at finish."
    },
    'CTA': {
      'Low Risk': "Direct call to one action. Keeping curiosity active onto the next video maximizes your queue.",
      'Medium Risk': "Standard call to action, but features multiple alternatives which might lead to choice paralysis.",
      'High Risk': "Abrupt closing or generic 'Don't forget to subscriber'. Retention will likely crater."
    }
  };

  if (paragraphs.length === 0) {
    // Fallback if no script is pasted
    scriptHighlights.push({
      text: "No script uploaded yet. Paste text to run a full highlighting review.",
      type: 'average',
      comment: "Add content to get modular paragraph highlight diagnostics."
    });
    
    segmentKeys.forEach(key => {
      retentionSegments.push({
        name: key,
        risk: 'Medium Risk',
        explanation: "Please enter a valid YouTube script to diagnose this segment."
      });
    });
  } else {
    // Match paragraphs to segments
    paragraphs.forEach((p, index) => {
      // Determine segment index
      let segmentIndex = 0;
      if (index === 0) segmentIndex = 0; // Intro
      else if (index === 1) segmentIndex = 1; // Problem
      else if (index === paragraphs.length - 1) segmentIndex = 4; // CTA
      else if (index === paragraphs.length - 2) segmentIndex = 3; // Solution
      else segmentIndex = 2; // Main Content

      const name = segmentKeys[segmentIndex];
      
      // Determine score type for the paragraph (strong, average, drop-off)
      // Heuristics:
      // - Too long paragraphs (> 80 words) risk "drop-off" (red)
      // - Short active statements (< 30 words) with questions/emotional keywords are "strong" (green)
      // - Otherwise "average" (yellow)
      const words = p.split(/\s+/).length;
      let type: 'strong' | 'average' | 'drop-off' = 'average';
      let comment = "";

      if (words > 75) {
        type = 'drop-off';
        comment = "Pacing warning: This paragraph has too many consecutive words. Break this up using real-time pauses or edit into two focused blocks.";
      } else if (words < 45 && (p.includes("?") || p.includes("!") || p.includes("you") || p.includes("secret") || p.includes("exactly"))) {
        type = 'strong';
        comment = "Great attention focus! High verbal impact, good use of emotional framing and active tone.";
      } else {
        type = 'average';
        comment = "Competent section. Ensure you deliver this portion with a dynamic, varied vocal range to sustain listener momentum.";
      }

      scriptHighlights.push({
        text: p,
        type,
        comment
      });
    });

    // Build the 5 core retention segments
    segmentKeys.forEach((key, index) => {
      // Pick dynamic risk based on overall metrics
      let risk: RiskLevel = 'Medium Risk';
      if (overallScore > 84) {
        risk = Math.random() > 0.3 ? 'Low Risk' : 'Medium Risk';
      } else if (overallScore < 70) {
        risk = Math.random() > 0.3 ? 'High Risk' : 'Medium Risk';
      } else {
        const rng = Math.random();
        risk = rng > 0.6 ? 'Low Risk' : (rng > 0.2 ? 'Medium Risk' : 'High Risk');
      }

      // Always give CTA Low Risk if suggestions or indicators look favorable
      if (key === 'CTA' && text.toLowerCase().includes("next video")) {
        risk = 'Low Risk';
      }
      if (key === 'Intro' && text.toLowerCase().includes("it was")) {
        risk = 'Low Risk';
      }

      retentionSegments.push({
        name: key,
        risk,
        explanation: segmentRiskExplanations[key][risk]
      });
    });
  }

  return {
    overallScore,
    viralPotential,
    retentionScore,
    clarityScore,
    hook: {
      strength: hookStrength,
      curiosity,
      emotionalTrigger
    },
    retention: retentionSegments,
    storytelling: {
      setup,
      conflict,
      resolution,
      pacing
    },
    readability: {
      readingLevel,
      sentenceLength,
      passiveVoice,
      complexityScore
    },
    engagement: {
      curiosity: engCuriosity,
      emotionalImpact: engEmotion,
      authority: engAuthority,
      entertainment: engEntertainment
    },
    suggestions,
    scriptHighlights,
    wordCount,
    estimatedDuration
  };
}
