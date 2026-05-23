/**
*  corsResponse.ts
*
*  @copyright 2025 Digital Aid Seattle
*
*/

export function corsResponse(origin: string): Response {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers":
                "Content-Type, Authorization, apikey, x-client-info",
            "Access-Control-Max-Age": "86400",
        },
    })
};