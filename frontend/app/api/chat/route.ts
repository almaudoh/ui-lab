import { config } from '../../config';

export async function POST(req: Request) {
  const { messages, sessionId } = await req.json();

  // Build the full URL
  const fullUrl = new URL(config.endpoint, config.backendUrl).toString();

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: {
        messages,
      },
      config: {
        configurable: {
          session_id: sessionId,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return Response.json({
    output: data.output || data,
  });
}
