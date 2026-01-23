export async function fetchWidgetData(endpoint: string, apiKey?: string) {
    try {
        // Use our internal proxy to hide the API key (if env var) or pass it safely
        // Detect GoldAPI automatically to use correct header
        let headerParam = '';
        if (endpoint.includes('goldapi.io')) {
            headerParam = '&header=x-access-token';
        }

        let tokenParam = '';
        if (apiKey) {
            tokenParam = `&token=${encodeURIComponent(apiKey)}`;
        }

        const proxyUrl = `/api/proxy?url=${encodeURIComponent(endpoint)}${tokenParam}${headerParam}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("API Error fetching:", endpoint, error);
        return null;
    }
}

// Helper to access nested object via string path "data.rates.USD"
export function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
