import { addWordToWordbook } from "../repositories/wordbook";
import { appendEvent } from "../repositories/events";

export async function saveVocabService(data: {
  word: string;
  definition: string;
  exampleSentence: string;
  sourceEssayId?: string;
}): Promise<string> {
  const id = await addWordToWordbook(data);
  await appendEvent("vocab_added", id, "wordbook", { word: data.word });
  return id;
}
