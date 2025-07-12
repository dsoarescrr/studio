import { NextResponse } from 'next/server';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/lib/firebase'; // Corrected import
import Stripe from 'stripe';

// Initialize Firebase Admin by getting the client-side app instance.
const adminApp = initializeAdminApp();
const db = getFirestore(adminApp);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret!);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
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
  } catch (error) {
    console.error(`Error handling webhook event: ${error}`);
    return NextResponse.json(
      { error: 'Error handling webhook event' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  if (!metadata || !metadata.userId) return;

  // Update payment intent in Firestore
  await db.collection('paymentIntents').doc(paymentIntent.id).update({
    status: paymentIntent.status,
    updatedAt: new Date(),
  });

  // If this is a pixel purchase, update pixel ownership
  if (metadata.pixelId) {
    await db.collection('pixels').doc(metadata.pixelId).update({
      ownerId: metadata.userId,
      purchaseDate: new Date(),
      purchaseAmount: paymentIntent.amount,
      transactionId: paymentIntent.id,
    });

    // Add credits to user
    const userRef = db.collection('users').doc(metadata.userId);
    await userRef.update({
      credits: FieldValue.increment(parseInt(metadata.creditsToAdd || '0')),
      specialCredits: FieldValue.increment(parseInt(metadata.specialCreditsToAdd || '0')),
    });
  }

  // Add transaction to user history
  await db.collection('users').doc(metadata.userId).collection('transactions').add({
    type: 'payment',
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'completed',
    paymentIntentId: paymentIntent.id,
    metadata: metadata,
    createdAt: new Date(),
  });
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  if (!metadata || !metadata.userId) return;

  // Update payment intent in Firestore
  await db.collection('paymentIntents').doc(paymentIntent.id).update({
    status: paymentIntent.status,
    updatedAt: new Date(),
  });

  // Add failed transaction to user history
  await db.collection('users').doc(metadata.userId).collection('transactions').add({
    type: 'payment',
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'failed',
    paymentIntentId: paymentIntent.id,
    metadata: metadata,
    createdAt: new Date(),
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Find the user associated with this customer
  const customerId = subscription.customer as string;
  const userSnapshot = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
  
  if (userSnapshot.empty) {
    console.error(`No user found for customer: ${customerId}`);
    return;
  }
  
  const userId = userSnapshot.docs[0].id;
  
  // Update subscription in Firestore
  await db.collection('subscriptions').doc(subscription.id).set({
    userId,
    customerId,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    createdAt: new Date(),
  });
  
  // Update user document
  await db.collection('users').doc(userId).update({
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    subscriptionPriceId: subscription.items.data[0].price.id,
    isPremium: subscription.status === 'active',
    premiumUntil: new Date(subscription.current_period_end * 1000),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Find the subscription in Firestore
  const subscriptionDoc = await db.collection('subscriptions').doc(subscription.id).get();
  
  if (!subscriptionDoc.exists) {
    console.error(`No subscription found with ID: ${subscription.id}`);
    return;
  }
  
  const userId = subscriptionDoc.data()?.userId;
  
  // Update subscription in Firestore
  await db.collection('subscriptions').doc(subscription.id).update({
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    updatedAt: new Date(),
  });
  
  // Update user document
  await db.collection('users').doc(userId).update({
    subscriptionStatus: subscription.status,
    subscriptionPriceId: subscription.items.data[0].price.id,
    isPremium: subscription.status === 'active',
    premiumUntil: new Date(subscription.current_period_end * 1000),
  });
  
  // If subscription is now active and was previously incomplete, add special credits
  if (subscription.status === 'active' && subscriptionDoc.data()?.status === 'incomplete') {
    // Determine if this is a monthly or annual plan
    const priceId = subscription.items.data[0].price.id;
    const isAnnual = priceId.includes('annual') || priceId.includes('yearly');
    
    // Add special credits based on plan
    await db.collection('users').doc(userId).update({
      specialCredits: FieldValue.increment(isAnnual ? 600 : 100),
    });
    
    // Add transaction record
    await db.collection('users').doc(userId).collection('transactions').add({
      type: 'subscription_bonus',
      amount: isAnnual ? 600 : 100,
      description: `Bónus de créditos especiais por subscrição ${isAnnual ? 'anual' : 'mensal'}`,
      createdAt: new Date(),
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Find the subscription in Firestore
  const subscriptionDoc = await db.collection('subscriptions').doc(subscription.id).get();
  
  if (!subscriptionDoc.exists) {
    console.error(`No subscription found with ID: ${subscription.id}`);
    return;
  }
  
  const userId = subscriptionDoc.data()?.userId;
  
  // Update subscription in Firestore
  await db.collection('subscriptions').doc(subscription.id).update({
    status: 'canceled',
    canceledAt: new Date(),
  });
  
  // Update user document
  await db.collection('users').doc(userId).update({
    subscriptionStatus: 'canceled',
    isPremium: false,
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  
  // Find the subscription in Firestore
  const subscriptionDoc = await db.collection('subscriptions').doc(invoice.subscription as string).get();
  
  if (!subscriptionDoc.exists) {
    console.error(`No subscription found with ID: ${invoice.subscription}`);
    return;
  }
  
  const userId = subscriptionDoc.data()?.userId;
  
  // Add transaction record
  await db.collection('users').doc(userId).collection('transactions').add({
    type: 'subscription_payment',
    amount: invoice.amount_paid,
    currency: invoice.currency,
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    status: 'completed',
    createdAt: new Date(),
  });
  
  // If this is a renewal, add monthly special credits
  if (invoice.billing_reason === 'subscription_cycle') {
    // Determine if this is a monthly or annual plan
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const priceId = subscription.items.data[0].price.id;
    
    // Add special credits based on plan
    await db.collection('users').doc(userId).update({
      specialCredits: FieldValue.increment(100),
    });
    
    // Add transaction record
    await db.collection('users').doc(userId).collection('transactions').add({
      type: 'subscription_bonus',
      amount: 100,
      description: 'Bónus mensal de créditos especiais',
      createdAt: new Date(),
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  
  // Find the subscription in Firestore
  const subscriptionDoc = await db.collection('subscriptions').doc(invoice.subscription as string).get();
  
  if (!subscriptionDoc.exists) {
    console.error(`No subscription found with ID: ${invoice.subscription}`);
    return;
  }
  
  const userId = subscriptionDoc.data()?.userId;
  
  // Add transaction record
  await db.collection('users').doc(userId).collection('transactions').add({
    type: 'subscription_payment',
    amount: invoice.amount_due,
    currency: invoice.currency,
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    status: 'failed',
    createdAt: new Date(),
  });
  
  // Update user document to reflect payment failure
  await db.collection('users').doc(userId).update({
    subscriptionStatus: 'past_due',
  });
}
