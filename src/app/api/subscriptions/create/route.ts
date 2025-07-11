import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/lib/firebase-admin';
import Stripe from 'stripe';

// Initialize Firebase Admin
const adminApp = initializeAdminApp();
const auth = getAuth(adminApp);
const db = getFirestore(adminApp);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // Get request body
    const body = await request.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Get or create customer
    const userDoc = await db.collection('users').doc(userId).get();
    let customerId = userDoc.exists ? userDoc.data()?.stripeCustomerId : null;

    if (!customerId) {
      // Create a new customer
      const userRecord = await auth.getUser(userId);
      const customer = await stripe.customers.create({
        email: userRecord.email || undefined,
        name: userRecord.displayName || undefined,
        metadata: {
          firebaseUserId: userId,
        },
      });
      
      customerId = customer.id;
      
      // Save customer ID to Firestore
      await db.collection('users').doc(userId).update({
        stripeCustomerId: customerId,
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Save subscription to Firestore
    await db.collection('subscriptions').doc(subscription.id).set({
      userId,
      customerId,
      priceId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      createdAt: new Date(),
    });

    // Update user document with subscription info
    await db.collection('users').doc(userId).update({
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPriceId: priceId,
      isPremium: true,
      premiumUntil: new Date(subscription.current_period_end * 1000),
    });

    // Get client secret for payment
    const invoice = subscription.latest_invoice as any;
    const clientSecret = invoice?.payment_intent?.client_secret;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}