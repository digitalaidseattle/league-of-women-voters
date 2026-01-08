// src/utils/service_runner.ts

import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5";
import type { ServiceWorker } from "../functions/types.ts";

// one shared parser for all services
const parser = new XMLParser({ removeNSPrefix: true });

export async function runService<P>(
  req: Request,
  getWorker: (params: P) => ServiceWorker<P>,
): Promise<Response> {
  const origin = req.headers.get("origin") || "*";

  try {
    const params = await req.json() as P;

    const worker = getWorker(params);
    worker.validate(params);

    const url = worker.getLegUrl(params);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Upstream request failed with status ${response.status}`,
      );
    }

    const xmlText = await response.text();
    const json = parser.parse(xmlText);
    const entities = worker.getEntities(json);

    return new Response(JSON.stringify(entities), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  } catch (err: any) {
    console.error("SOAP request failed:", err);

    const statusCode = err?.cause === "BadRequest" ? 400 : 500;

    return new Response(
      JSON.stringify({
        error: err?.message ?? "Internal Server Error",
      }),
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
        },
      },
    );
  }
}
