"use client";
import { Textarea } from "@/components/ui/textarea";
import { useEssayStore } from "@/stores/essay-store";
import { WordCounter } from "./WordCounter";
import { cn } from "@/lib/utils";

interface EssayEditorProps {
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const WORD_LIMIT = 600;
const WORD_MIN = 150;

export function EssayEditor({ disabled, className, placeholder }: EssayEditorProps) {
  const { body, setBody } = useEssayStore();
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const isUnderMin = wordCount > 0 && wordCount < WORD_MIN;
  const isOverLimit = wordCount > WORD_LIMIT;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={disabled}
        placeholder={placeholder ?? "Start writing your essay here..."}
        className={cn(
          "min-h-[500px] resize-none font-serif text-base leading-relaxed",
          isUnderMin && "border-amber-400 focus-visible:ring-amber-400",
          isOverLimit && "border-red-500 focus-visible:ring-red-500"
        )}
        spellCheck
      />
      <div className="flex justify-between items-center">
        {isOverLimit ? (
          <p className="text-sm text-red-600">
            字数 {wordCount} 已超过 {WORD_LIMIT} 词上限。雅思 Task 2 标准是 250–300 词，过长不会获得更高分，且会显著增加批改时间和成本。请精简后再提交。
          </p>
        ) : isUnderMin ? (
          <p className="text-sm text-amber-600">
            至少需要 {WORD_MIN} 词才能提交（当前 {wordCount} 词）
          </p>
        ) : (
          <span />
        )}
        <WordCounter count={wordCount} min={WORD_MIN} />
      </div>
    </div>
  );
}

export { WORD_LIMIT };
