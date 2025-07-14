import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';
import { FieldValue } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!endpointSecret) {
      throw new Error("Stripe webhook secret is not set.");
    }
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Error handling webhook event: ${error.message}`);
    return NextResponse.json(
      { error: 'Error handling webhook event' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  if (!metadata || !metadata.userId) return;

  await adminDb.collection('paymentIntents').doc(paymentIntent.id).update({
    status: paymentIntent.status,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (metadata.pixelId) {
    await adminDb.collection('pixels').doc(metadata.pixelId).update({
      ownerId: metadata.userId,
      purchaseDate: FieldValue.serverTimestamp(),
      purchaseAmount: paymentIntent.amount,
      transactionId: paymentIntent.id,
    });
  }

  await adminDb.collection('users').doc(metadata.userId).collection('transactions').add({
    type: 'payment',
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'completed',
    paymentIntentId: paymentIntent.id,
    metadata: metadata,
    createdAt: FieldValue.serverTimestamp(),
  });
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  if (!metadata || !metadata.userId) return;

  await adminDb.collection('paymentIntents').doc(paymentIntent.id).update({
    status: paymentIntent.status,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await adminDb.collection('users').doc(metadata.userId).collection('transactions').add({
    type: 'payment',
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'failed',
    paymentIntentId: paymentIntent.id,
    metadata: metadata,
    createdAt: FieldValue.serverTimestamp(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userSnapshot = await adminDb.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
  
  if (userSnapshot.empty) {
    console.error(`No user found for customer: ${customerId}`);
    return;
  }
  
  const userId = userSnapshot.docs[0].id;
  const userRef = adminDb.collection('users').doc(userId);

  await adminDb.collection('subscriptions').doc(subscription.id).set({
    userId,
    customerId,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    createdAt: new Date(subscription.created * 1000),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  
  await userRef.update({
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    subscriptionPriceId: subscription.items.data[0].price.id,
    isPremium: subscription.status === 'active' || subscription.status === 'trialing',
    premiumUntil: new Date(subscription.current_period_end * 1000),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionDoc = await adminDb.collection('subscriptions').doc(subscription.id).get();
  
  if (!subscriptionDoc.exists) {
    console.error(`No subscription found with ID: ${subscription.id}`);
    return;
  }
  
  const userId = subscriptionDoc.data()?.userId;
  
  await adminDb.collection('subscriptions').doc(subscription.id).update({
    status: 'canceled',
    canceledAt: FieldValue.serverTimestamp(),
  });
  
  await adminDb.collection('users').doc(userId).update({
    subscriptionStatus: 'canceled',
    isPremium: false,
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  
  const subscriptionDoc = await adminDb.collection('subscriptions').doc(invoice.subscription as string).get();
  
  if (!subscriptionDoc.exists) return;
  
  const userId = subscriptionDoc.data()?.userId;
  const userRef = adminDb.collection('users').doc(userId);

  await userRef.collection('transactions').add({
    type: 'subscription_payment',
    amount: invoice.amount_paid,
    currency: invoice.currency,
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    status: 'completed',
    createdAt: FieldValue.serverTimestamp(),
  });
  
  if (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_create') {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const priceId = subscription.items.data[0].price.id;
    const isAnnual = priceId.includes('annual') || priceId.includes('yearly');
    const creditsToAdd = isAnnual ? 600 : 100;

    await userRef.update({
      specialCredits: FieldValue.increment(creditsToAdd),
    });
    
    await userRef.collection('transactions').add({
      type: 'subscription_bonus',
      amount: creditsToAdd,
      description: `Bónus de créditos por subscrição ${isAnnual ? 'anual' : 'mensal'}`,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  
  const subscriptionDoc = await adminDb.collection('subscriptions').doc(invoice.subscription as string).get();
  if (!subscriptionDoc.exists) return;
  
  const userId = subscriptionDoc.data()?.userId;
  
  await adminDb.collection('users').doc(userId).collection('transactions').add({
    type: 'subscription_payment',
    amount: invoice.amount_due,
    currency: invoice.currency,
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    status: 'failed',
    createdAt: FieldValue.serverTimestamp(),
  });
  
  await adminDb.collection('users').doc(userId).update({
    subscriptionStatus: 'past_due',
  });
}
