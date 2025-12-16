const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

async function forward(req: Request, path: string[]) {
  const targetURL = `${BACKEND_URL}/${path.join("/")}`;

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.text();

  const response = await fetch(targetURL, {
    method: req.method,
    headers: {
      "content-type": "application/json",
    },
    body,
  });

  const text = await response.text();

  return new Response(text, {
    status: response.status,
    headers: response.headers,
  });
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  return forward(req, path);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  return forward(req, path);
}
