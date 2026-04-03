import type { ConsultantMemory } from '$lib/types/consultant';

class ConsultantMemoryState {
  memories = $state<ConsultantMemory[]>([]);

  getMemories(consultantId: string, projectId?: string): ConsultantMemory[] {
    return this.memories.filter(
      (m) =>
        m.consultantId === consultantId &&
        (!projectId || m.projectId === projectId)
    );
  }

  setMemories(memories: ConsultantMemory[]) {
    this.memories = memories;
  }

  addMemory(memory: ConsultantMemory) {
    this.memories = [...this.memories, memory];
  }

  formatForPrompt(consultantId: string): string {
    const relevant = this.getMemories(consultantId);
    if (relevant.length === 0) return '';
    return relevant.map((m) => `- ${m.key}: ${m.value}`).join('\n');
  }
}

export const consultantMemoryState = new ConsultantMemoryState();
