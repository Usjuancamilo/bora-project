import React, { useState } from 'react';

function Login({ onLogin }) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    console.log('API_URL:', process.env.REACT_APP_API_URL);


    const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(
        'Intentando login a:',
        `${process.env.REACT_APP_API_URL}/api/auth/login`
    );

    try {

        const auth = btoa(`${username}:${password}`);

        localStorage.setItem('auth', auth);

        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/auth/login`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            }
        );

        if (response.ok) {
            onLogin();
        } else {
            setError('Usuario o contraseña incorrectos');
        }

    } catch (err) {
        setError('Error de conexión');
        console.error('Error:', err);
    }
};




    return (
        <div>
            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Usuario"
                />

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                />

                <button type="submit">
                    Iniciar sesión
                </button>

                {error && <p>{error}</p>}

            </form>
        </div>
    );
}

export default Login;