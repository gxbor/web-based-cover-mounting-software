import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();

const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const { orderData } = data;
    
    // Create a new order in Firestore
    const orderRef = await admin.firestore().collection('orders').add({
      userId: context.auth.uid,
      ...orderData,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Custom Book Order',
              description: `${orderData.config.bindingType} book with ${orderData.config.pageCount} pages`,
            },
            unit_amount: Math.round(orderData.total * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${data.domain}/success?order=${orderRef.id}`,
      cancel_url: `${data.domain}/cancel`,
      metadata: {
        orderId: orderRef.id,
      },
    });

    // Update order with session ID
    await orderRef.update({
      checkoutSessionId: session.id,
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error creating checkout session'
    );
  }
});

export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  if (!signature) {
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      functions.config().stripe.webhook_secret
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await admin.firestore().collection('orders').doc(orderId).update({
            status: 'paid',
            paymentIntentId: session.payment_intent,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;
      }
      // Handle other webhook events as needed
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(400).send('Webhook Error');
  }
});