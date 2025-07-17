/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import admin from "firebase-admin";

// Inicialize o Firebase Admin só uma vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(request: Request) {
  const rawBody = await request.arrayBuffer();
  const buf = Buffer.from(rawBody);
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Quando o pagamento for concluído:
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata) {
      const { groupId, userId, blockedId } = session.metadata;
      try {
        // Atualiza o participante como premium no Firestore:
        await admin
          .firestore()
          .collection("groups")
          .doc(groupId)
          .collection("participants")
          .doc(userId)
          .update({ blockedId });
      } catch (e) {
        console.error("Erro ao atualizar participante premium:", e);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
