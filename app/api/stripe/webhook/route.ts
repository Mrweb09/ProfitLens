import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const planLimits: Record<string, { plan: "STARTER" | "GROWTH" | "AGENCY"; limit: number }> = {
  starter: { plan: "STARTER", limit: 10 },
  growth: { plan: "GROWTH", limit: 50 },
  agency: { plan: "AGENCY", limit: -1 },
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const planKey = session.metadata?.plan as string;

    if (userId && planKey && planLimits[planKey]) {
      const { plan, limit } = planLimits[planKey];
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          auditsLimit: limit,
          auditsUsed: 0,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: planKey,
          stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await prisma.user.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        plan: "FREE",
        auditsLimit: 1,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      },
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = invoice.parent?.subscription_details?.subscription;
    if (subId && typeof subId === "string") {
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subId },
        data: {
          auditsUsed: 0,
          stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
