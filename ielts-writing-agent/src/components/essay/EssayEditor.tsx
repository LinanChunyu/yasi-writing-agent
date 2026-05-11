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

export function EssayEditor({ disabled, className, placeholder }: EssayEditorProps) {
  const { body, setBody } = useEssayStore();
  const wordCount = body.split(/\s+/).filter(Boolean).length;
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
          isOverLimit && "border-red-500 focus-visible:ring-red-500"
        )}
        spellCheck
      />
      <div className="flex justify-between items-center">
        {isOverLimit ? (
          <p className="text-sm text-red-600">
            字数 {wordCount} 已超过 {WORD_LIMIT} 词上限。雅思 Task 2 标准是 250–300 词，过长不会获得更高分，且会显著增加批改时间和成本。请精简后再提交。
          </p>
        ) : (
          <span />
        )}
        <WordCounter count={wordCount} />
      </div>
    </div>
  );
}

export { WORD_LIMIT };
