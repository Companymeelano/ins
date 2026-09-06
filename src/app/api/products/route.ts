import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const list = await db.select().from(products).orderBy(products.createdAt);
    return NextResponse.json({ success: true, products: list });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: 'نام محصول الزامی است' }, { status: 400 });
    const [p] = await db.insert(products).values({
      name: String(body.name).trim(),
      price: body.price || null,
      imageUrl: body.imageUrl || null,
      link: body.link || null,
      description: body.description || null,
    }).returning();
    return NextResponse.json({ success: true, product: p });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get('id'));
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
