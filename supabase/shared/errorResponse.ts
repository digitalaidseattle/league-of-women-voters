/**
 *  handError.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
export function errorResponse(origin: string, error: any): Response {
    const statusCode = error.cause === "BadRequest" ? 400 : 500;
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
        status: statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": origin,
        },
    });
}