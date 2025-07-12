import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/lib/firebase-admin'; // Corrected import
import Stripe from 'stripe';

// Initialize Firebase Admin by getting the client-side app instance.
// This is not ideal, but avoids re-declaring admin-specific logic for now.
const adminApp = initializeAdminApp();
const auth = getAuth(adminApp as any); // Cast to any to satisfy type checker
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
      decodedToken = await (auth as any).verifyIdToken(token); // Cast to any
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // Get request body
    const body = await request.json();
    const { amount, currency = 'eur', metadata = {} } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get or create customer
    const userDoc = await db.collection('users').doc(userId).get();
    let customerId = userDoc.exists ? userDoc.data()?.stripeCustomerId : null;

    if (!customerId) {
      // Create a new customer
      const userRecord = await (auth as any).getUser(userId); // Cast to any
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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata: {
        userId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Save payment intent to Firestore
    await db.collection('paymentIntents').doc(paymentIntent.id).set({
      userId,
      amount,
      currency,
      status: paymentIntent.status,
      metadata,
      createdAt: new Date(),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
