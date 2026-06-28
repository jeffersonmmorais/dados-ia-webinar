import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  const headers = new Headers(response.headers);

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https://www.facebook.com https://www.google.com https://www.google.com.br https://www.google-analytics.com https://googleads.g.doubleclick.net; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://www.googleadservices.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.facebook.com https://connect.facebook.net; frame-src https://www.googletagmanager.com https://td.doubleclick.net; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
});
