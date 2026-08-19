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
  {
    id: "minimax",
    name: "minimax",
    shortName: "Mavis",
    ecosystemName: "Mavis ecosystem",
    description:
      "minimax's foundation models, minimax Code coding agent, Mavis agent runtime, and developer platform.",
    homepageUrl: "https://minimax.com/",
    accent: "#5b5fc7",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    shortName: "DeepSeek",
    ecosystemName: "DeepSeek ecosystem",
    description:
      "DeepSeek's open-weight models, free chat app, developer API, and agent harness.",
    homepageUrl: "https://www.deepseek.com/",
    accent: "#4d6bfe",
  },
] satisfies Vendor[];
