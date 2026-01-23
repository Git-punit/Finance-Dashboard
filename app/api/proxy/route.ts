import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    const apiKey = searchParams.get('token') || process.env.FINANCE_API_KEY;
    const headerName = searchParams.get('header') || 'Authorization'; // Default to Auth header

    // console.log(`Proxying request to: ${targetUrl}`); // Debug log

    const headers: HeadersInit = {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    // Attach auth header if key exists
    if (apiKey) {
        if (headerName === 'Authorization' && !apiKey.startsWith('Bearer ')) {
            headers[headerName] = `Bearer ${apiKey}`;
        } else {
            headers[headerName] = apiKey;
        }
    }

    try {
        const res = await fetch(targetUrl, {
            headers,
        });

        if (!res.ok) {
            console.error(`Proxy upstream error: ${res.status} ${res.statusText} for ${targetUrl}`);
            // Clone response to read text if JSON fails
            const errorText = await res.text();
            console.error('Upstream response:', errorText);
            return NextResponse.json({ error: `Upstream error: ${res.status}`, details: errorText }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Proxy Internal Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
