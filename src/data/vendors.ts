import type { Vendor } from "@/data/schema";

export const vendors = [
  {
    id: "anthropic",
    name: "Anthropic",
    shortName: "Claude",
    ecosystemName: "Claude ecosystem",
    description:
      "Anthropic's Claude products, coding agents, developer platform, and organizational offerings.",
    homepageUrl: "https://www.anthropic.com/",
    accent: "#d97757",
  },
  {
    id: "openai",
    name: "OpenAI",
    shortName: "ChatGPT",
    ecosystemName: "ChatGPT ecosystem",
    description:
      "OpenAI's ChatGPT products, Codex coding agents, developer platform, and organizational offerings.",
    homepageUrl: "https://openai.com/",
    accent: "#168c6b",
  },
] satisfies Vendor[];
