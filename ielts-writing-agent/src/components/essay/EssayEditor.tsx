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

export function EssayEditor({ disabled, className, placeholder }: EssayEditorProps) {
  const { body, setBody } = useEssayStore();
  const wordCount = body.split(/\s+/).filter(Boolean).length;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={disabled}
        placeholder={placeholder ?? "Start writing your essay here..."}
        className="min-h-[500px] resize-none font-serif text-base leading-relaxed"
        spellCheck
      />
      <div className="flex justify-end">
        <WordCounter count={wordCount} />
      </div>
    </div>
  );
}
