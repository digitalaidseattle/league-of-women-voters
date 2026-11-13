/**
 *  handError.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
export function standardResponse(origin: string, payload: string): Response {
    // Content-Type is JSON, so the body must be valid JSON for clients to parse it
    return new Response(
        JSON.stringify(payload),
        {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": origin,
            }
        }
    );
}