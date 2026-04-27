/// <reference types="vite/client" />

declare module "*.md" {
  const content: {
    html: string;
    toc: Array<{ depth: number; text: string; slug: string }>;
    frontmatter: Record<string, unknown>;
  };
  export default content;
}
