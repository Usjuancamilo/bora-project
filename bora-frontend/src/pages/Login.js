import React, { useState } from 'react';

function Login({ onLogin}){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

const handleSubmit = async (e) => {
    e.preventDefault();


    const credentials = btoa(`${username}:${password}`);
    

    try{
        const response = await fetch(
  `${process.env.REACT_APP_API_URL}/auth/login`, {
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });


        if (response.ok) {
            localStorage.setItem('auth', credentials);
            onLogin();

        } else {
            setError('Usuario o contraseña incorrectos');
        }

    } catch (err) {
        setError('Error de conexión');
    }
};


    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#faf9f7'
        }}>
        
        <div style={{
            background: '#fff',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgb(0,0,0,0.1)',
            width: '100%',
            maxWidth: '400px'
        }}>


        <h1 style={{
            fontFamily: " 'Cormorant Garamond', Georgia, serif",
            fontSize: '32px',
            marginBottom: '8px',
            textAlign: 'center'
        }}>Bora</h1>
        <p style={{
          fontSize: '12px',
          color: '#b0ada7',
          textAlign: 'center',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          marginBottom: '30px'
        }}>Tienda Virtual</p>


<form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', color: '#7a7872', display: 'block', marginBottom: '5px' }}>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e8e5df',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: '#7a7872', display: 'block', marginBottom: '5px' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e8e5df',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>
          
          {error && <p style={{ color: '#dc3545', fontSize: '13px', marginBottom: '15px' }}>{error}</p>}
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#1a1917',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Iniciar sesión
          </button>
        </form>
        
        <p style={{ fontSize: '12px', color: '#b0ada7', marginTop: '20px', textAlign: 'center' }}>
          Usuario: admin | Contraseña: admin123
        </p>
      </div>
    </div>
  );
}

export default Login;