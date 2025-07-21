/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil", // Use uma versão estável!
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Checa se todos os campos necessários vieram no body
    const { groupId, userId, blockedId } = body;
    if (!groupId || !userId || !blockedId) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Somente cartão, por enquanto
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: { name: 'Preferência premium' },
            unit_amount: 1100, // R$11,00 em centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://www.amigosecretotop.com.br/sucesso', // Altere para domínio real em produção!
      cancel_url: 'https://www.amigosecretotop.com.br/cancelado', // Altere depois
      metadata: { groupId, userId, blockedId }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: err?.message || "Erro inesperado ao criar checkout session" }, { status: 500 });
  }
}
