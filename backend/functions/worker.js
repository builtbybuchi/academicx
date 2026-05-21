/**
 * Cloudflare Worker entry point for AcademicX backend
 * Wraps the existing request handler to work with Cloudflare Worker fetch API
 */

const handler = require('./index.js');

export default {
  async fetch(request, env) {
    // Set environment variables from Cloudflare bindings for handler
    Object.assign(process.env, env);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-AcademicX-Auth-Id',
        },
      });
    }

    try {
      // Read request body
      let rawBody = '';
      if (request.body) {
        rawBody = await request.text();
      }

      // Parse URL and query params
      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams.entries());

      // Extract IP from Cloudflare
      const forwardedFor = request.headers.get('cf-connecting-ip') || '';
      const realIp = request.headers.get('x-real-ip') || '';
      const ip = forwardedFor || realIp || 'unknown';

      // Build normalized request object (same format as server.js)
      const normalizedReq = {
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: rawBody,
        queryString: JSON.stringify(query),
        path: url.pathname,
        ip,
        userAgent: request.headers.get('user-agent') || '',
      };

      // Create response wrapper that builds a Response object
      let responseStatus = 200;
      let responseHeaders = {};
      let responseBody = '';

      const wrappedRes = {
        text(body, status = 200, headers = {}) {
          responseStatus = status;
          responseHeaders = { ...headers };
          responseBody = body || '';
        },
        json(payload, status = 200, headers = {}) {
          responseStatus = status;
          responseHeaders = {
            'Content-Type': 'application/json; charset=utf-8',
            ...headers,
          };
          responseBody = JSON.stringify(payload);
        },
        send(body, status = 200, headers = {}) {
          responseStatus = status;
          responseHeaders = { ...headers };
          responseBody = body || '';
        },
      };

      // Call handler
      await handler({
        req: normalizedReq,
        res: wrappedRes,
        error: (message) => {
          if (message) console.error(message);
        },
      });

      // If handler didn't set a response, default to success message
      if (!responseBody) {
        responseStatus = 200;
        responseHeaders = { 'Content-Type': 'application/json; charset=utf-8' };
        responseBody = JSON.stringify({ success: true, message: 'Request processed.' });
      }

      // Add CORS headers to all responses
      const finalHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-AcademicX-Auth-Id',
        ...responseHeaders,
      };

      return new Response(responseBody, {
        status: responseStatus,
        headers: finalHeaders,
      });
    } catch (err) {
      console.error('Handler error:', err);
      return new Response(
        JSON.stringify({
          success: false,
          error: err.message || 'Unexpected server error.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
