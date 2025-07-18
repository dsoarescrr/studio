
// src/lib/auth-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  AuthProvider as FirebaseAuthProvider // Renamed to avoid conflict with our component
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider, twitterProvider, githubProvider } from './firebase';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from './store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  logOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { 
    addCredits, 
    addSpecialCredits, 
    addXp, 
    unlockAchievement 
  } = useUserStore();

  useEffect(() => {
    // The auth object might not be available immediately on SSR
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user exists in Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          // Update last login
          await updateDoc(userRef, {
            lastLogin: serverTimestamp()
          });
          
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta ao Pixel Universe!",
      });
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast({
        title: "Erro no login",
        description: getAuthErrorMessage(error.code),
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's profile in Firebase Authentication
      await updateProfile(user, { displayName: username });
      
      // Create user document in Firestore with all necessary initial data
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        displayName: username,
        email: user.email,
        photoURL: user.photoURL || '',
        credits: 500,
        specialCredits: 50,
        level: 1,
        xp: 0,
        xpMax: 1000,
        achievements: [],
        pixels: [],
        isPremium: false,
        isVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      toast({
        title: "Registo bem-sucedido",
        description: "A sua conta foi criada com sucesso!",
      });
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        title: "Erro no registo",
        description: getAuthErrorMessage(error.code),
        variant: "destructive",
      });
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Sessão terminada",
        description: "Esperamos vê-lo em breve!",
      });
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Erro ao terminar sessão",
        description: "Ocorreu um erro ao terminar a sessão. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithSocialProvider = async (provider: FirebaseAuthProvider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user document exists, create if not
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          credits: 500,
          specialCredits: 50,
          xp: 0,
          level: 1,
          pixels: [],
          achievements: [],
          isPremium: false,
          isVerified: user.emailVerified
        });
      } else {
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
          photoURL: user.photoURL,
          displayName: user.displayName
        });
      }
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao Pixel Universe!",
      });
    } catch (error: any) {
      console.error("Error signing in with social provider:", error);
      toast({
        title: "Erro no login",
        description: getAuthErrorMessage(error.code),
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = () => signInWithSocialProvider(googleProvider);
  const signInWithFacebook = () => signInWithSocialProvider(facebookProvider);
  const signInWithTwitter = () => signInWithSocialProvider(twitterProvider);
  const signInWithGithub = () => signInWithSocialProvider(githubProvider);

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Email enviado",
        description: "Verifique o seu email para redefinir a password.",
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "Erro ao redefinir password",
        description: getAuthErrorMessage(error.code),
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUserProfile = async (displayName?: string, photoURL?: string) => {
    try {
      if (!user) throw new Error("No user logged in");
      
      const updates: { displayName?: string; photoURL?: string } = {};
      if (displayName) updates.displayName = displayName;
      if (photoURL) updates.photoURL = photoURL;
      
      await updateProfile(user, updates);
      
      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
      
      toast({
        title: "Perfil atualizado",
        description: "As suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao atualizar o seu perfil. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Email inválido.';
      case 'auth/user-disabled':
        return 'Esta conta foi desativada.';
      case 'auth/user-not-found':
        return 'Não existe uma conta com este email.';
      case 'auth/wrong-password':
        return 'Password incorreta.';
      case 'auth/email-already-in-use':
        return 'Este email já está em uso.';
      case 'auth/weak-password':
        return 'A password é demasiado fraca.';
      case 'auth/popup-closed-by-user':
        return 'Login cancelado. A janela foi fechada.';
      case 'auth/account-exists-with-different-credential':
        return 'Já existe uma conta com este email mas com um método de login diferente.';
      case 'auth/operation-not-allowed':
        return 'Esta operação não é permitida.';
      case 'auth/requires-recent-login':
        return 'Esta operação requer um login recente. Por favor, faça login novamente.';
      default:
        return 'Ocorreu um erro. Por favor, tente novamente.';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        logOut,
        signInWithGoogle,
        signInWithFacebook,
        signInWithTwitter,
        signInWithGithub,
        resetPassword,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
