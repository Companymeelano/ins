import { NextRequest, NextResponse } from 'next/server';
import { enqueue, getJob, type JobType } from '@/lib/queue';
import { ensureHandlers } from '@/lib/job-handlers';
import { enforceRate } from '@/lib/rate-limit';

// ایجاد job → 202 Accepted (کاربر منتظر نمی‌ماند)
export async function POST(request: NextRequest) {
  const limited = enforceRate(request, 'jobs', 30, 60000);
  if (limited) return limited;
  ensureHandlers();

  try {
    const body = await request.json();
    const type = body.type as JobType;
    if (!['image', 'caption', 'reel', 'analysis'].includes(type)) {
      return NextResponse.json({ error: 'نوع job نامعتبر' }, { status: 400 });
    }
    const jobId = await enqueue(type, body.payload || {});
    return NextResponse.json({ success: true, jobId, status: 'queued' }, { status: 202 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در ایجاد job' }, { status: 500 });
  }
}

// polling وضعیت job
export async function GET(request: NextRequest) {
  const id = Number(request.nextUrl.searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'شناسه لازم است' }, { status: 400 });
  const job = await getJob(id);
  if (!job) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 });
  return NextResponse.json({ success: true, status: job.status, result: job.result, error: job.error });
}
