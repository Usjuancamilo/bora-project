import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';
import Calendario from './pages/Calendario';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState('dashboard');
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (auth) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
  };

  const navegarA = (p) => {
    setPage(p);
    setMenuAbierto(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex min-h-screen font-sans">

      {/* Overlay móvil */}
      {menuAbierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-100
        flex flex-col z-30 transition-transform duration-300
        ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-100">
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-3xl font-normal text-gray-900 leading-none">
            Bora
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">
            Tienda Virtual
          </div>
        </div>

        {/* Navegación */}
        <div className="flex-1 py-2">
          <div className="px-4 pt-4 pb-1 text-xs font-medium text-gray-300 uppercase tracking-widest">
            Principal
          </div>

          <NavItem label="Inicio"     icon="🏠" active={page === 'dashboard'}  onClick={() => navegarA('dashboard')} />
          <NavItem label="Ventas"     icon="🛒" active={page === 'ventas'}     onClick={() => navegarA('ventas')} />
          <NavItem label="Clientes"   icon="👥" active={page === 'clientes'}   onClick={() => navegarA('clientes')} />
          <NavItem label="Calendario" icon="📅" active={page === 'calendario'} onClick={() => navegarA('calendario')} />

          <div className="px-4 pt-4 pb-1 text-xs font-medium text-gray-300 uppercase tracking-widest">
            Más
          </div>
          <NavItem label="Reportes" icon="📊" active={false} onClick={() => {}} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-medium">
              B
            </div>
            <div>
              <div className="text-xs font-medium text-gray-800">Administradora</div>
              <div className="text-xs text-gray-400">Bora Tienda Virtual</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-gray-400 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-56 bg-stone-50 min-h-screen p-4 md:p-10 relative">

        {/* Botón hamburguesa — solo móvil y solo cuando el menú está cerrado */}
      {!menuAbierto && (
        <button
          className="md:hidden fixed top-4 left-4 z-40 bg-white border border-gray-200 rounded-lg p-2 shadow-sm"
          onClick={() => setMenuAbierto(true)}
        >
          <div className="w-5 h-0.5 bg-gray-700 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-700 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-700"></div>
          </button>
    )}


        {/* Fecha y hora — solo desktop */}
        <div className="hidden md:block">
          <FechaHora />
        </div>

        <div className="mt-8 md:mt-0">
          {page === 'dashboard'  && <Dashboard />}
          {page === 'clientes'   && <Clientes />}
          {page === 'ventas'     && <Ventas />}
          {page === 'calendario' && <Calendario />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ label, active, onClick, icon }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 mx-2 my-0.5 rounded-lg text-sm cursor-pointer transition-all
        ${active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-stone-50'}`}
    >
      <span className="text-lg">{icon}</span>
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
  const fechaFormateada = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1).toLowerCase();
  const horaStr = ahora.toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <div className="absolute top-5 right-10 text-right">
      <div className="text-xs font-medium text-gray-600">{fechaFormateada}</div>
      <div className="text-xs text-gray-400 mt-0.5">{horaStr}</div>
    </div>
  );
}

export default App;