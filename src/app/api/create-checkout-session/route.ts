import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  // use os dados de body aqui...

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // usar 'card' por enquanto
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: { name: 'Preferência premium' },
            unit_amount: 990,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://SEU_SITE.com/sucesso',
      cancel_url: 'https://SEU_SITE.com/cancelado',
      metadata: {
        groupId: body.groupId,
        userId: body.userId,
        blockedId: body.blockedId
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: err?.message || "Erro inesperado ao criar checkout session" }, { status: 500 });
  }
}
