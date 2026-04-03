import type { PhaseNumber } from '$lib/types/project';
import { marcusPrompt } from './marcus-strategist';
import { elenaPrompt } from './elena-architect';
import { jamesPrompt } from './james-analyst';
import { sophiaPrompt } from './sophia-designer';
import { alexPrompt } from './alex-engineer';
import { priyaPrompt } from './priya-qa';
import { viktorPrompt } from './viktor-devops';

export const SYSTEM_PROMPTS: Record<PhaseNumber, string> = {
  1: marcusPrompt,
  2: elenaPrompt,
  3: jamesPrompt,
  4: sophiaPrompt,
  5: alexPrompt,
  6: priyaPrompt,
  7: viktorPrompt
};

export function getSystemPrompt(phaseNumber: PhaseNumber): string {
  return SYSTEM_PROMPTS[phaseNumber];
}
