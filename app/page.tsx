"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import "./globals.css";

const HomePage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page de login
    router.push('/login');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f1f4f9, #81a3bc)',
      color: '#fff',
      fontSize: '18px'
    }}>
      Redirection vers la page de connexion...
    </div>
  );
};

export default HomePage;