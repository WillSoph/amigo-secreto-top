import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

// Exemplo para /api/create-checkout-session (Next.js API Route ou Route Handler)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // só cartão por enquanto
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: { name: 'Preferência premium' },
            unit_amount: 990, // R$9,90 (em centavos)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://SEU_SITE.com/sucesso',
      cancel_url: 'https://SEU_SITE.com/cancelado',
      // Passe metadata se quiser vincular ao usuário, grupo, etc
      metadata: req.body ? {
        groupId: req.body.groupId,
        userId: req.body.userId,
        blockedId: req.body.blockedId
      } : {}
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({
      error: err?.message || "Erro inesperado ao criar checkout session",
    });
  }
}

