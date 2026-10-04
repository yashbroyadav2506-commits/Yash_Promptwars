/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CrisisCheck {
  isCrisis: boolean;
  message: string;
  hotlines: Array<{ name: string; contact: string; desc: string }>;
}

const CRISIS_KEYWORDS = [
  /\b(kill\s+(myself|me)|suicid(e|al)|end\s+my\s+life|want\s+to\s+die|hang\s+myself)\b/i,
  /\b(self[-\s]?harm|cut\s+my\s+wrists|overdose|take\s+all\s+my\s+pills)\b/i,
  /\b(no\s+reason\s+to\s+live|better\s+off\s+dead|can't\s+go\s+on\s+living)\b/i,
  /\b(physically\s+abusing\s+me|beating\s+me\s+up|in\s+immediate\s+danger)\b/i
];

export function detectCrisis(text: string): CrisisCheck {
  const combined = text.toLowerCase();
  for (const regex of CRISIS_KEYWORDS) {
    if (regex.test(combined)) {
      return {
        isCrisis: true,
        message: 
          "It sounds like you may be going through an intense or painful moment. " +
          "BlindSpot is a cognitive decision analysis tool and cannot provide personal or psychological crisis support. " +
          "Please reach out to trusted professionals or compassionate, trained lifelines right now.",
        hotlines: [
          { name: "988 Suicide & Crisis Lifeline (US/Canada)", contact: "Call or text 988", desc: "Free, confidential 24/7 support" },
          { name: "Crisis Text Line", contact: "Text HOME to 741741", desc: "Connect with a crisis counselor 24/7" },
          { name: "Befrienders Worldwide (International)", contact: "https://www.befrienders.org", desc: "Find confidential help across 30+ countries" },
          { name: "The Trevor Project (LGBTQ youth)", contact: "Call 1-866-488-7386 or text START to 678-678", desc: "24/7 suicide prevention counseling" }
        ]
      };
    }
  }

  return {
    isCrisis: false,
    message: "",
    hotlines: []
  };
}
