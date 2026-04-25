import { ServiceWorker } from "../types.ts";


type PassThruParams = {
    url: string;
    biennium?: string;
};

// This pass thru deals with CORS restrictions
class PassThruWorker implements ServiceWorker<PassThruParams> {

    validate(params: PassThruParams) {

    }

    getLegUrl(params: PassThruParams): string {
        return params.url;
    }

    getEntities(json: any): any {
        return json;
    }

}

function getWorker(_params: PassThruParams): ServiceWorker<PassThruParams> {
    return new PassThruWorker();
}

Deno.serve(async (req) => {
    const origin = req.headers.get("origin") || "*";
    // Handle preflight CORS (OPTIONS)
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers":
                    "Content-Type, Authorization, apikey, x-client-info",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    try {
        const params = await req.json();
        const worker = getWorker(params);
        let resp = await fetch(worker.getLegUrl(params));
        let text = await resp.text();

        return new Response(text, {
            headers: {
                "Content-Type": "application/html",
                "Access-Control-Allow-Origin": origin,
            },
        });
    } catch (err) {
        console.error("SOAP request failed:", err);
        throw err;
    }
});