import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Correo o contraseña incorrectos");
          break;
        case "auth/invalid-email":
          setError("Correo electrónico inválido");
          break;
        case "auth/user-disabled":
          setError("Esta cuenta ha sido deshabilitada");
          break;
        case "auth/too-many-requests":
          setError("Demasiados intentos fallidos. Intenta más tarde");
          break;
        default:
          setError("Error al iniciar sesión. Intenta nuevamente");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <FileText size={32} className="text-green-700" />
            <span className="text-2xl font-bold text-green-700">
              Birrieria La Purisima
            </span>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-md rounded-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Ve más allá con Birrieria La Purisima
          </h2>

          <p className="text-center text-gray-600 mb-8">
            Ingresa tu correo y contraseña
            <br />
            para iniciar sesión.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
              <AlertCircle size={16} className="mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">
                Correo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Correo"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Contraseña"
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full btn btn-primary"
                disabled={loading}
              >
                {loading ? "Iniciando sesión..." : "Ingresar"}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col items-center space-y-4">
            <button
              className="text-sm text-green-700 hover:text-green-800"
              disabled={loading}
            >
              Crear cuenta
            </button>
            <button
              className="text-sm text-green-700 hover:text-green-800"
              disabled={loading}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          {/* <p>Birrieria La Purisima</p> */}
          <p className="mt-2">Copyright 2025, Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
