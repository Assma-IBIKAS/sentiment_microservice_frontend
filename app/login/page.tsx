"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {
      username: "",
      password: ""
    };
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData1 = new URLSearchParams();
    formData1.append("username", formData.username);
    formData1.append("password", formData.password);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError("");

    try {
      console.log('🔐 Tentative de login avec:', {
        username: formData.username,
        password: formData.password
      });

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData1.toString(), // toString() pour s'assurer d'envoyer une string
      });
    
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const data = await response.json();
      console.log('📋 Response data:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      if (data.access_token) {
        localStorage.setItem('jwt_token', data.access_token);
        console.log('✅ Token stocké:', data.access_token);
      }
      if (data) {
        localStorage.setItem('jwt_token', data);
        console.log('✅ User stocké:', data);
      }
      
      const storedToken = localStorage.getItem('jwt_token');
      console.log('✅ Token vérifié après stockage:', storedToken ? storedToken.substring(0, 20) + '...' : 'NULL');
      
      if (!storedToken) {
        throw new Error('Token non stocké correctement');
      }
      
      setTimeout(() => {
        router.push('/sentiment');
      }, 500);
      
    } catch (err) {
      console.error('❌ Erreur login:', err);
      setSubmitError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              <h2>Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="inputBox">
                  <input 
                    type="text" 
                    name="username"
                    placeholder="username" 
                    value={formData.username}
                    onChange={handleInputChange}
                    className={errors.username ? "error" : ""}
                    required
                  />
                  {errors.username && (
                    <div className="error-message">
                      {errors.username}
                    </div>
                  )}
                </div>
                <div className="inputBox">
                  <div className="password-container">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      placeholder="password" 
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? "error" : ""}
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? "🐵" : "🙈"}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="error-message">
                      {errors.password}
                    </div>
                  )}
                </div>
                
                {submitError && (
                  <div className="submit-error">
                    {submitError}
                  </div>
                )}
                
                <div className="inputBox">
                  <input 
                    type="submit" 
                    value={isLoading ? "Connexion..." : "Se connecter"} 
                    disabled={isLoading}
                    style={{
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
