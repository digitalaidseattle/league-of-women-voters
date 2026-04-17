/**
 *  handError.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
export function standardResponse(origin: string, payload: string): Response {
    return new Response(
        payload,
        {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": origin,
            }
        }
    );
}