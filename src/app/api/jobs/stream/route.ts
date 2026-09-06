import { NextRequest } from 'next/server';
import { getJob } from '@/lib/queue';

// SSE — push وضعیت job به‌جای polling
export async function GET(request: NextRequest) {
  const id = Number(request.nextUrl.searchParams.get('id'));
  if (!id) return new Response('id required', { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (data: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // polling داخلی سرور + push به کلاینت
      const started = Date.now();
      const interval = setInterval(async () => {
        try {
          const job = await getJob(id);
          if (!job) { send({ status: 'not_found' }); cleanup(); return; }
          send({ status: job.status, result: job.result, error: job.error });
          if (job.status === 'done' || job.status === 'failed') cleanup();
          if (Date.now() - started > 120000) cleanup(); // timeout ۲ دقیقه
        } catch { cleanup(); }
      }, 1000);

      function cleanup() {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      }

      request.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
