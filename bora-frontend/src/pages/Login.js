import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const auth = btoa(`${username}:${password}`);
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/auth/login`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                }
            );
            if (response.ok) {
                localStorage.setItem('auth', auth);
                onLogin();
            } else {
                setError('Usuario o contraseña incorrectos');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    return (
        <div className="login-container">
            <div className="login-title">Bora</div>
            <div className="login-subtitle">TIENDA VIRTUAL</div>
            <form onSubmit={handleSubmit}>
                <label>Usuario</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Usuario"
                />
                <label>Contraseña</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                />
                <button type="submit" className="login-btn">
                    Iniciar sesión
                </button>
                {error && <p className="login-error">{error}</p>}
            </form>
            <p className="login-hint">Usuario: admin | Contraseña: admin123</p>
        </div>
    );
}

export default Login;