import type { RequestHandler } from '@sveltejs/kit';

const handler: RequestHandler = async (event) => {
  const targetUrl = event.url.searchParams.get('url');
  if (!targetUrl) {
    return new Response('Missing "url" query parameter', { status: 400 });
  }

  const headers = new Headers(event.request.headers);

  headers.delete('Referer');
  headers.delete('Origin');

  const request = new Request(targetUrl, {
    method: event.request.method,
    headers: headers,
    body: event.request.body,
    redirect: event.request.redirect
  });

  try {
    const originalResponse = await fetch(request);

    const response = new Response(originalResponse.body, originalResponse);
    response.headers.set('Cache-Control', 'public, max-age=86400, immutable');

    return response;
  } catch (error) {
    console.error(`Error forwarding request to ${targetUrl}:`, error);
    return new Response('Error forwarding request', { status: 500 });
  }
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;
export const HEAD = handler;
