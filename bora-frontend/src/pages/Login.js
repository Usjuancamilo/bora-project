import React, { useState } from 'react';

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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-md p-8">

                <h1 className="text-center text-4xl font-bold mb-1">Bora</h1>
                <p className="text-center text-gray-400 text-xs tracking-widest mb-7">
                    TIENDA VIRTUAL
                </p>

                <form onSubmit={handleSubmit}>
                    <label className="block text-sm text-gray-600 mb-1">Usuario</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Usuario"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />

                    <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />

                    <button
                        type="submit"
                        className="w-full bg-gray-900 text-white py-3 rounded-lg text-base hover:bg-gray-700 transition-colors"
                    >
                        Iniciar sesión
                    </button>

                    {error && (
                        <p className="text-red-500 text-sm text-center mt-3">{error}</p>
                    )}
                </form>

                <p className="text-center text-xs text-gray-400 mt-5">
                    Usuario: admin | Contraseña: admin123
                </p>
            </div>
        </div>
    );
}

export default Login;