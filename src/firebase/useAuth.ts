import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};


export const handleLogin = async (e: React.FormEvent, email: string, password: string) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logado:", userCredential.user);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

export const handleSignup = async (e: React.FormEvent, email: string, password: string) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Usuário criado:", userCredential.user);
      alert("Usuário criado com sucesso!");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

export const signInWithGoogle = async () => {
      try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          console.log("Usuário logado:", user);
      } catch (error: any) {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error("Erro ao fazer login com Google:", errorCode, errorMessage);
      }
  };