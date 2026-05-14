const http = require('http');
const { URL } = require('url');
const handler = require('./index.js');

const PORT = Number(process.env.PORT || 8080);

function createResponse(res) {
    return {
        text(body, status = 200, headers = {}) {
            if (res.writableEnded) return;
            res.writeHead(status, headers);
            res.end(body || '');
        },
        json(payload, status = 200, headers = {}) {
            if (res.writableEnded) return;
            res.writeHead(status, {
                'Content-Type': 'application/json; charset=utf-8',
                ...headers,
            });
            res.end(JSON.stringify(payload));
        },
        send(body, status = 200, headers = {}) {
            if (res.writableEnded) return;
            res.writeHead(status, headers);
            res.end(body || '');
        },
    };
}

const server = http.createServer((req, res) => {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-AcademicX-Auth-Id');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', async () => {
        try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
            const query = Object.fromEntries(requestUrl.searchParams.entries());
            const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
            const realIp = String(req.headers['x-real-ip'] || '').trim();
            const socketIp = String(req.socket?.remoteAddress || req.connection?.remoteAddress || '').trim();

            const normalizedReq = {
                method: req.method,
                headers: req.headers,
                body: rawBody,
                queryString: JSON.stringify(query),
                path: requestUrl.pathname,
                ip: forwardedFor || realIp || socketIp || 'unknown',
                userAgent: req.headers['user-agent'] || '',
            };

            const wrappedRes = createResponse(res);

            await handler({
                req: normalizedReq,
                res: wrappedRes,
                error: (message) => {
                    if (message) console.error(message);
                },
            });

            if (!res.writableEnded) {
                wrappedRes.json({ success: true, message: 'Request processed.' }, 200);
            }
        } catch (err) {
            if (!res.writableEnded) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: false, error: err.message || 'Unexpected server error.' }));
            }
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`AcademicX functions server listening on port ${PORT}`);
});
