"use client";

import React, { useState, useEffect } from "react";
// Suppression de l'import Next.js : import { useRouter } from "next/navigation";
// Suppression de l'import CSS externe : import "../globals.css";

// Définition des types pour le résultat (adapté pour votre backend)
interface SentimentResult {
  score: number;
  sentiment: string;
  confidence?: number;
  label?: string;
}

// Composant principal de la page d'analyse de sentiment
const SentimentPage: React.FC = () => {
  // Remplacement de useRouter par un état local pour gérer la "redirection"
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [text, setText] = useState("");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier et récupérer le token au chargement
    const storedToken = localStorage.getItem('jwt_token');
    
    if (!storedToken) {
      // Pas de token, l'utilisateur n'est pas connecté
      setIsLoggedIn(false);
    } else {
      // Token trouvé, l'utilisateur est connecté
      setToken(storedToken);
      setIsLoggedIn(true);
    }
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError("Veuillez entrer un texte à analyser");
      return;
    }

    const storedToken = localStorage.getItem('jwt_token');
    if (!storedToken) {
      setError("Session expirée. Veuillez vous reconnecter.");
      setIsLoggedIn(false); // Force le re-rendu vers l'écran de connexion
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      // Le token est stocké sans préfixe Bearer après le login, on l'utilise directement.
      const cleanToken = storedToken;

      // Préparer les données en form-urlencoded pour le backend FastAPI
      const formData = new URLSearchParams();
      formData.append("text", text.trim());

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // En-tête standard
          'Authorization': `Bearer ${cleanToken}`,
          // En-tête non-standard requis par votre backend
          'token': cleanToken 
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Si le backend renvoie 401 ou 422, cela signifie que le token est invalide/expiré
        if (response.status === 401 || response.status === 422) {
             throw new Error("Authentification échouée. Veuillez vous reconnecter.");
        }
        throw new Error(errorData.detail || `Erreur ${response.status}`);
      }

      const result: SentimentResult = await response.json();
      setResult(result);

    } catch (err) {
      console.error('Erreur:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);

      if (errorMessage.includes("Authentification échouée")) {
        // Déconnecte l'utilisateur si l'authentification a échoué
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false); // Cela bascule vers l'écran de connexion
  };

  const handleRelogin = () => {
    // Nettoie et recharge pour simuler un "retour à la page d'accueil/login" propre
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    setIsLoggedIn(false); 
    if (typeof window !== 'undefined') {
        window.location.reload(); 
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch(sentiment) {
      case 'positif': return '#4ade80';
      case 'negatif': return '#f87171';
      case 'neutre': return '#fbbf24';
      default: return '#94a3b8';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch(sentiment) {
      case 'positif': return '😊';
      case 'negatif': return '😔';
      case 'neutre': return '😐';
      default: return '😐';
    }
  };

  const getScoreStars = (score: number) => {
    // Assure que le score est entre 0 et 5
    const normalizedScore = Math.max(0, Math.min(score, 5)); 
    const fullStars = '⭐'.repeat(Math.floor(normalizedScore));
    const emptyStars = '☆'.repeat(5 - Math.floor(normalizedScore)); 
    return fullStars + emptyStars;
  };

  // Si l'utilisateur n'est pas connecté, afficher l'écran de connexion/reconnexion
  if (!isLoggedIn) {
    return (
      <>
        <style>
        {`
          /* Styles pour l'écran de déconnexion/reconnexion */
          @keyframes bounceIn {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-30px);
            }
            60% {
                transform: translateY(-15px);
            }
          }
        `}
        </style>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
          color: '#fff',
          flexDirection: 'column',
          gap: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{animation: 'bounceIn 1.5s ease-in-out'}}>🔒 Session requise</h1>
          <p>Vous devez vous connecter pour utiliser l'analyseur de sentiment.</p>
          <button 
            onClick={handleRelogin}
            style={{
              background: '#4f46e5', // Indigo 600
              border: 'none',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
              transition: 'all 0.3s ease',
              marginTop: '10px'
            }}
          >
            Se connecter / Se reconnecter
          </button>
        </div>
      </>
    );
  }

  // Rendu principal de l'application (une fois connecté)
  return (
    <>
      <style>
      {`
        /* Styles CSS critiques intégrés */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        }

        section {
            position: relative;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #1e293b; 
            overflow: hidden;
            padding: 20px;
        }

        section .color{
            position: absolute;
            filter: blur(150px);
        }
        section .color:nth-child(1){
            top: -350px;
            width: 600px;
            height: 600px;
            background: #ff6b35;
        }

        section .color:nth-child(2){
            bottom: -150px;
            left: 100px;
            width: 500px;
            height: 500px;
            background: #a4a255;
        }
        section .color:nth-child(3){
            bottom: 50px;
            left: 100px;
            width: 300px;
            height: 300px;
            background: #0292b3;
        }

        .box{
            position: relative;
        }
        .box .square{
            position: absolute;
            backdrop-filter: blur(5px);
            box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-right: 1px solid rgba(255, 255, 255, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            animation: animate 10s linear infinite;
            animation-delay: calc(-1s * var(--i));
        }

        @keyframes animate {
            0%, 100% {
                transform: translateY(-40px);
            }
            50% {
                transform: translateY(40px);
            }
        }

        .box .square:nth-child(1) {
            top: -50px;
            right: -60px;
            width: 100px;
            height: 100px;
        }

        .box .square:nth-child(2) {
            top: 150px;
            left: -100px;
            width: 120px;
            height: 120px;
            z-index: 2;
        }

        .box .square:nth-child(3) {
            bottom: 50px;
            right: -60px;
            width: 80px;
            height: 80px;
            z-index: 2;
        }

        .box .square:nth-child(4) {
            bottom: -80px;
            left: 100px;
            width: 50px;
            height: 50px;
        }

        .box .square:nth-child(5) {
            top: -80px;
            left: 140px;
            width: 60px;
            height: 60px;
        }

        .container {
            position: relative;
            width: 400px;
            max-width: 90%; /* Responsiveness */
            min-height: 400px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(5px);
            box-shadow: 0 25px 45px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-right: 1px solid rgba(255, 255, 255, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .form {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 40px;
        }

        .form h2 {
            color: #fff;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .form .inputBox {
            width: 100%;
            margin-top: 20px;
        }

        .form .inputBox input[type="submit"] {
            background: #fff;
            color: #626262;
            max-width: 150px;
            cursor: pointer;
            margin-bottom: 20px;
            font-weight: 600;
            padding: 10px 20px;
            border-radius: 10px;
            border: none;
        }

        .form .inputBox input[type="submit"]:hover {
            background: #047109ff;
            color: #fff;
            box-shadow: 0 0 10px #08e42cff;
        }

        @keyframes slideIn {
            0% {
                opacity: 0;
                transform: translateY(-10px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Ajustements pour la petite barre du haut */
        .header-bar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            padding: 15px 40px;
            display: flex;
            justify-content: flex-end;
            z-index: 20;
        }
        
        @media (max-width: 500px) {
            .form {
                padding: 20px;
            }
            .header-bar {
                padding: 15px 20px;
            }
            .box {
              margin: 40px 0;
            }
            section {
              padding-top: 80px; /* Espace pour la barre de titre */
            }
        }
      `}
      </style>

      {/* Barre de Déconnexion en haut */}
      <div className="header-bar">
        <button 
            onClick={handleLogout}
            style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease'
            }}
            >
            Déconnexion
        </button>
      </div>

      <div>
        <section>
          <div className="color"></div>
          <div className="color"></div>
          <div className="color"></div>
          <div className="box">
            <div className="square" style={{ "--i": 0 } as React.CSSProperties}></div>
            <div className="square" style={{ "--i": 1 } as React.CSSProperties}></div>
            <div className="square" style={{ "--i": 2 } as React.CSSProperties}></div>
            <div className="square" style={{ "--i": 3 } as React.CSSProperties}></div>
            <div className="square" style={{ "--i": 4 } as React.CSSProperties}></div>

            <div className="container">
              <div className="form">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <div>
                    <h2>Analyse de Sentiment</h2>
                    {user && (
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        fontSize: '12px', 
                        margin: '5px 0 0 0' 
                      }}>
                        Connecté en tant que: {user}
                      </p>
                    )}
                  </div>
                  {/* Le bouton de déconnexion a été déplacé dans la barre supérieure pour une meilleure UI */}
                </div>
                
                <form onSubmit={handleAnalyze}>
                  <div className="inputBox">
                    <textarea
                      placeholder="Entrez votre texte ici pour l'analyse de sentiment..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      required
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                        outline: 'none',
                        padding: '15px 20px',
                        borderRadius: '15px',
                        fontSize: '16px',
                        color: '#fff',
                        minHeight: '120px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        transition: 'all 0.3s ease',
                        opacity: isLoading ? 0.6 : 1
                      }}
                    />
                  </div>
                  
                  {error && (
                    <div style={{ 
                      color: '#ff6b6b', 
                      fontSize: '14px', 
                      marginTop: '10px',
                      textAlign: 'center',
                      padding: '8px',
                      background: 'rgba(255, 107, 107, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      animation: 'slideIn 0.3s ease'
                    }}>
                      {error}
                    </div>
                  )}
                  
                  <div className="inputBox">
                    <input 
                      type="submit" 
                      value={isLoading ? "Analyse en cours..." : "Analyser"} 
                      disabled={isLoading}
                      style={{
                        opacity: isLoading ? 0.7 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                </form>

                {/* Section des résultats qui s'affiche seulement si 'result' n'est pas null */}
                {result && (
                  <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    textAlign: 'center',
                    animation: 'slideIn 0.3s ease',
                    maxWidth: '400px',
                    margin: '20px auto',
                    position: 'relative' // S'assurer que les résultats sont bien dans le formulaire
                  }}>
                    <h3 style={{ 
                      color: '#fff', 
                      marginBottom: '15px',
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>
                      🎭 Résultat de l'Analyse
                    </h3>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-around', 
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          color: '#fff', 
                          fontSize: '14px', 
                          marginBottom: '10px',
                          fontWeight: '500'
                        }}>
                          Score
                        </div>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold',
                          color: getSentimentColor(result.sentiment),
                          marginBottom: '5px'
                        }}>
                          {result.score}/5
                        </div>
                        <div style={{ fontSize: '16px' }}>
                          {getScoreStars(result.score)}
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          color: '#fff', 
                          fontSize: '14px', 
                          marginBottom: '10px',
                          fontWeight: '500'
                        }}>
                          Sentiment
                        </div>
                        <div style={{ fontSize: '36px', marginBottom: '5px' }}>
                          {getSentimentIcon(result.sentiment)}
                        </div>
                        <div style={{ 
                          color: getSentimentColor(result.sentiment),
                          fontSize: '18px', 
                          fontWeight: 'bold',
                          textTransform: 'capitalize'
                        }}>
                          {result.sentiment}
                        </div>
                      </div>
                    </div>
                    
                    {result.confidence !== undefined && (
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '12px', 
                        marginTop: '10px',
                        opacity: 0.8
                      }}>
                        Confiance: {(result.confidence * 100).toFixed(1)}%
                        {result.label && ` • ${result.label}`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SentimentPage;