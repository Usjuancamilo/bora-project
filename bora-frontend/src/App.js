import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';
import Calendario from './pages/Calendario';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (auth) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* Sidebar */}
      <aside style={{ 
        width: '220px', 
        background: '#fff', 
        borderRight: '1px solid #e8e5df',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0
      }}>
        
        {/* Logo */}
        <div style={{ 
          padding: '24px 22px 18px',
          borderBottom: '1px solid #f0ede8'
        }}>
          <div style={{ 
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '28px',
            fontWeight: 400,
            color: '#1a1917',
            lineHeight: 1
          }}>Bora</div>
          <div style={{ 
            fontSize: '10px',
            color: '#b0ada7',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            marginTop: '3px'
          }}>Tienda Virtual</div>
        </div>

        {/* Navegación */}
        <div style={{ flex: 1 }}>
          <div style={{ 
            padding: '16px 14px 4px',
            fontSize: '10px',
            fontWeight: 500,
            color: '#b0ada7',
            textTransform: 'uppercase',
            letterSpacing: '.1em'
          }}>Principal</div>
          
          <NavItem 
          label="Inicio" 
          icon="🏠"
          active={page === 'dashboard'} 
          onClick={() => setPage('dashboard')} 
          />

          <NavItem 
            label="Ventas" 
            icon="🛒"
            active={page === 'ventas'} 
            onClick={() => setPage('ventas')} 
          />

          <NavItem 
            label="Clientes" 
            icon="👥"
            active={page === 'clientes'} 
            onClick={() => setPage('clientes')} 
          />

          <NavItem 
            label="Calendario" 
            icon="📅"
            active={page === 'calendario'} 
            onClick={() => setPage('calendario')} 
          />

          <div style={{ 
            padding: '16px 14px 4px',
            fontSize: '10px',
            fontWeight: 500,
            color: '#b0ada7',
            textTransform: 'uppercase',
            letterSpacing: '.1em'
          }}>Más</div>
          
          <NavItem label="Reportes" icon="📊" active={false} onClick={() => {}} />


        </div>

        {/* Footer con botón de logout */}
        <div style={{ 
          padding: '16px 18px',
          borderTop: '1px solid #f0ede8'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px'
          }}>
            <div style={{ 
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#1a1917',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 500,
              color: '#fff'
            }}>B</div>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 500 }}>Administradora</div>
              <div style={{ fontSize: '11px', color: '#b0ada7' }}>Bora Tienda Virtual</div>
            </div>
          </div>
          
          <button onClick={handleLogout} style={{
            marginTop: '10px',
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid #e8e5df',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            width: '100%',
            color: '#7a7872'
          }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main style={{ 
        marginLeft: '220px',
        flex: 1,
        background: '#faf9f7',
        padding: '40px',
        position: 'relative'  // ← agregar esto
  }}>

      {/* Fecha y hora superior derecha */}
        <FechaHora />
        {page === 'dashboard' && <Dashboard />}
        {page === 'clientes' && <Clientes />}
        {page === 'ventas' && <Ventas />}
        {page === 'calendario' && <Calendario />}
      </main>
    </div>
  );
}

// Componente de navegación
function NavItem({ label, active, onClick, icon }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        margin: '2px 8px',
        borderRadius: '8px',
        fontSize: '13.5px',
        color: active ? '#fff' : '#7a7872',
        background: active ? '#1a1917' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s'
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = '#faf9f7';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{fontSize:'18px'}}>{icon}</span>
      {label}
    </div>
  );
}


function FechaHora() {
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const fechaStr = ahora.toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // Primera letra mayúscula, resto minúscula
  const fechaFormateada = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1).toLowerCase();

  const horaStr = ahora.toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <div style={{
      position: 'absolute', top: '20px', right: '40px',
      textAlign: 'right'
    }}>
      <div style={{ fontSize: '12px', color: '#555', fontWeight: '500' }}>
        {fechaFormateada}
      </div>
      <div style={{ fontSize: '11px', color: '#757575', marginTop: '2px' }}>
        {horaStr}
      </div>
    </div>
  );
}

export default App;