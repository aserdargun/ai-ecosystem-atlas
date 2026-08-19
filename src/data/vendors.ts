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
  {
    id: "zai",
    name: "Z.ai",
    shortName: "GLM",
    ecosystemName: "GLM ecosystem",
    description:
      "Z.ai's GLM models, Z.ai chat, ZCode coding agent, developer platform, and organizational offerings.",
    homepageUrl: "https://z.ai/",
    accent: "#3a66c4",
  },
] satisfies Vendor[];
