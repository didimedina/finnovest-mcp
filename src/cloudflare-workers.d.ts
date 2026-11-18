// Minimal typing for the Workers runtime env. Bindings come from wrangler.jsonc and .dev.vars.
declare module "cloudflare:workers" {
  export const env: { readonly USE_LOCAL_DATA?: string };
}
