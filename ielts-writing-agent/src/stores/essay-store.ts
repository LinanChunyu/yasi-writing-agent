import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EssayDraft {
  essayId: string | null;
  questionId: string | null;
  questionPrompt: string;
  body: string;
  mode: "real" | "assist";
  timerSeconds: number;
  timerRunning: boolean;
  lastSavedAt: number | null;
}

interface EssayStore extends EssayDraft {
  setEssayId: (id: string) => void;
  setQuestion: (id: string, prompt: string) => void;
  setBody: (body: string) => void;
  setMode: (mode: "real" | "assist") => void;
  tickTimer: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  markSaved: () => void;
  reset: () => void;
}

const defaultState: EssayDraft = {
  essayId: null,
  questionId: null,
  questionPrompt: "",
  body: "",
  mode: "assist",
  timerSeconds: 0,
  timerRunning: false,
  lastSavedAt: null,
};

export const useEssayStore = create<EssayStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setEssayId: (id) => set({ essayId: id }),
      setQuestion: (id, prompt) => set({ questionId: id, questionPrompt: prompt }),
      setBody: (body) => set({ body }),
      setMode: (mode) => set({ mode }),
      tickTimer: () => set((s) => ({ timerSeconds: s.timerSeconds + 1 })),
      startTimer: () => set({ timerRunning: true }),
      stopTimer: () => set({ timerRunning: false }),
      markSaved: () => set({ lastSavedAt: Date.now() }),
      reset: () => set(defaultState),
    }),
    {
      name: "ielts-essay-draft",
      partialize: (s) => ({
        essayId: s.essayId,
        questionId: s.questionId,
        questionPrompt: s.questionPrompt,
        body: s.body,
        mode: s.mode,
        timerSeconds: s.timerSeconds,
      }),
    }
  )
);
