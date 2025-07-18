/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import admin from "firebase-admin";

// Inicialize o Firebase Admin só uma vez
if (!admin.apps.length) {
  console.log("Iniciando Firebase Admin...");
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

  // LOG para depuração (atenção: não logar chaves privadas em produção)
  if (!sig) {
    console.error("Stripe-Signature header missing!");
    return new Response("Missing signature", { status: 400 });
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook secret missing!");
    return new Response("Webhook secret not set", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("[Webhook] Evento Stripe recebido:", event.type);
  } catch (err: any) {
    console.error("[Webhook] Erro ao validar assinatura Stripe:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Quando o pagamento for concluído:
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("[Webhook] Session object recebido:", JSON.stringify(session, null, 2));
    if (session.metadata) {
      const { groupId, userId, blockedId } = session.metadata;
      console.log("[Webhook] Metadata recebida:", { groupId, userId, blockedId });

      if (!groupId || !userId || !blockedId) {
        console.error("[Webhook] Um dos campos de metadata está faltando.");
      } else {
        try {
          const docRef = admin
            .firestore()
            .collection("groups")
            .doc(groupId)
            .collection("participants")
            .doc(userId);

          // Antes do update, tenta buscar o documento
          const docSnap = await docRef.get();
          if (!docSnap.exists) {
            console.error("[Webhook] Documento do usuário não encontrado:", userId);
          } else {
            await docRef.update({ blockedId });
            console.log("[Webhook] blockedId atualizado com sucesso para userId:", userId);
          }
        } catch (e) {
          console.error("[Webhook] Erro ao atualizar participante premium:", e);
        }
      }
    } else {
      console.error("[Webhook] Session.metadata não está presente.");
    }
  } else {
    console.log("[Webhook] Evento ignorado:", event.type);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
