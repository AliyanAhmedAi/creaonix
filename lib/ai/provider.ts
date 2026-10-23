export type DraftRequest = { task: "ideas" | "script"; topic: string; audience: string; tone: string; brandVoice?: string };

export interface AIProvider {
  draft(input: DraftRequest): Promise<string>;
}
