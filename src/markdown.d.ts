// Wrangler bundles Markdown imports as text modules.
declare module "*.md" {
  const content: string;
  export default content;
}
