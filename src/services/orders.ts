import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { BookConfig } from '../types/book';

export interface Order extends DocumentData {
  userId: string;
  config: BookConfig;
  status: 'pending' | 'paid' | 'processing' | 'shipped';
  total: number;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentIntentId?: string;
}

export async function createOrder(orderData: Omit<Order, 'id'>) {
  try {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getUserOrders(userId: string) {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
}