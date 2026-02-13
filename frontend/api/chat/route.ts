export async function POST(req: Request) {
  const { message, sessionId } = await req.json();

  const fullUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}`;

  const res = await fetch(
    fullUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          messages: [
            { role: "user", content: message }
          ]
        },
        config: {
          configurable: {
            session_id: sessionId
          }
        }
      }),
    }
  );

  return new Response(res.body, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
