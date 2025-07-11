// Cloudflare Workers entry point
// This file tells Cloudflare to serve static assets directly
// and not process them through the Workers runtime

export default {
  async fetch(request, env, ctx) {
    // For static assets, serve directly without processing
    return env.ASSETS.fetch(request);
  },
};
