export type WritingStage =
  | "blank"
  | "stance_undecided"
  | "outline_drafting"
  | "intro_writing"
  | "body_writing"
  | "near_completion"
  | "completed";

export const STAGE_OVERLAYS: Record<WritingStage, string> = {
  blank: `[STAGE: blank] The candidate has not started writing yet.
Focus: Help them understand the question and decide on a position.
Ask: What is the question asking? What are the two sides? Which side resonates with you?`,

  stance_undecided: `[STAGE: stance_undecided] The candidate has started but hasn't committed to a clear position.
Focus: Help them clarify their stance.
Ask: Do you agree or disagree? Why? What personal experience or knowledge supports your view?`,

  outline_drafting: `[STAGE: outline_drafting] The candidate is working on an outline or early draft.
Focus: Help them structure their argument.
Ask: What is your main argument? What 2-3 supporting points will you use? Do you have a clear conclusion in mind?`,

  intro_writing: `[STAGE: intro_writing] The candidate is writing the introduction.
Focus: Help them craft a strong introduction with a clear thesis.
Ask: Have you paraphrased the question? Is your thesis statement clear? Do you preview the main points?`,

  body_writing: `[STAGE: body_writing] The candidate is writing body paragraphs.
Focus: Help them develop ideas with specific support and good paragraph structure.
Ask: Does each paragraph have a clear topic sentence? Have you explained WHY, not just WHAT? Do you have a specific example?`,

  near_completion: `[STAGE: near_completion] The candidate has written most of the essay but may be missing a conclusion.
Focus: Help them write a strong conclusion and check coherence.
Ask: Have you restated your thesis? Does your conclusion follow from your arguments? Are your ideas connected with appropriate cohesive devices?`,

  completed: `[STAGE: completed] The candidate has finished the essay.
Focus: Help them review and improve specific aspects.
Ask: Which part are you least confident about? Can you find any grammar errors? Are there words you've repeated too often?`,
};

export function getStageOverlay(stage: WritingStage): string {
  return STAGE_OVERLAYS[stage] ?? STAGE_OVERLAYS.blank;
}
