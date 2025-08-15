import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { CookieSettings, CookiePreferences } from '../types/cookies';

const ACCESS_CODE = 'MB-TB-2025';

export async function signUp(email: string, password: string, accessCode: string) {
  if (accessCode !== ACCESS_CODE) {
    throw new Error('Invalid access code');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document with access code
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      createdAt: new Date().toISOString(),
      accessCode: ACCESS_CODE, // Store the access code to validate in rules
      cookieSettings: null,
      cookiePreferences: null,
      lastLogin: new Date().toISOString()
    });

    return userCredential.user;
  } catch (error: any) {
    // Clean up auth user if Firestore write fails
    if (auth.currentUser) {
      try {
        await auth.currentUser.delete();
      } catch (deleteError) {
        console.error('Error cleaning up auth user:', deleteError);
      }
    }
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Verify user has valid access code
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists() || userDoc.data().accessCode !== ACCESS_CODE) {
      await signOut(auth);
      throw new Error('Invalid access code or user not found');
    }

    // Update last login
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      lastLogin: new Date().toISOString()
    }, { merge: true });

    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

export async function logOut() {
  return signOut(auth);
}

export async function saveCookieSettings(
  userId: string,
  settings: CookieSettings,
  preferences: CookiePreferences
) {
  return setDoc(doc(db, 'users', userId), {
    cookieSettings: settings,
    cookiePreferences: preferences,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function loadCookieSettings(userId: string) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return {
      settings: userDoc.data().cookieSettings,
      preferences: userDoc.data().cookiePreferences
    };
  }
  return null;
}