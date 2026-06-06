import React, { useState, useEffect } from 'react';
import { clientesAPI, ventasAPI, eventosAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState({ ganancia: 0, ingresos: 0, clientes: 0 });
  const [ventasMes, setVentasMes] = useState([]);
  const [pendientesHoy, setPendientesHoy] = useState([]);

  useEffect(() => {
    cargarStats();
    cargarPendientes();
  }, []);

  const cargarStats = async () => {
    try {
      const clientes = await clientesAPI.count();
      const ingresos = await ventasAPI.ingresosTotal();
      const ganancia = await ventasAPI.gananciaTotal();
      const data = await ventasAPI.ventasPorMes();
      const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      setVentasMes(data.map(item => ({ mes: meses[Number(item[0]) - 1], total: Number(item[1]) })));
      setStats({ ganancia: Number(ganancia || 0), ingresos: Number(ingresos || 0), clientes: Number(clientes || 0) });
    } catch (error) {
      console.error('Error cargando stats:', error);
    }
  };

  const cargarPendientes = async () => {
    try {
      const data = await eventosAPI.hoy();
      setPendientesHoy(data);
    } catch (error) {
      console.error('Error cargando pendientes:', error);
    }
  };

  const completar = async (id) => {
    await eventosAPI.completar(id);
    cargarPendientes();
  };

  const cancelar = async (id) => {
    await eventosAPI.cancelar(id);
    cargarPendientes();
  };

  const formatCOP = (valor) => Number(valor || 0).toLocaleString('es-CO');
  const margen = stats.ingresos > 0 ? Math.round((stats.ganancia / stats.ingresos) * 100) : 0;

  const colorPrioridad = (p) => {
    if (p === 'ALTA') return 'border-l-red-500';
    if (p === 'MEDIA') return 'border-l-yellow-500';
    return 'border-l-green-500';
  };

  const badgePrioridad = (p) => {
    if (p === 'ALTA') return 'bg-red-100 text-red-700';
    if (p === 'MEDIA') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const hoyStr = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const pendientesActivos = pendientesHoy.filter(e => !e.completado && !e.cancelado);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto font-sans">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-400">Resumen general del negocio</p>
      </div>

      {/* Pendientes de hoy */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-gray-800 mb-1">Pendientes de hoy</p>
            <p className="text-xs text-gray-400 capitalize">{hoyStr}</p>
          </div>
          {pendientesActivos.length > 0 && (
            <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
              {pendientesActivos.length} pendientes
            </span>
          )}
        </div>

        {pendientesActivos.length === 0 ? (
          <div className="text-center py-8 text-gray-300 text-sm">
            No tienes pendientes para hoy ✨
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendientesActivos.map(ev => (
              <div
                key={ev.id}
                className={`flex items-center justify-between p-3 rounded-lg border border-gray-100 border-l-4 ${colorPrioridad(ev.prioridad)}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 mb-1">{ev.titulo}</p>
                  {ev.descripcion && (
                    <p className="text-xs text-gray-400 mb-1">{ev.descripcion}</p>
                  )}
                  <div className="flex items-center gap-2">
                    {ev.hora && (
                      <span className="text-xs text-gray-300">⏰ {ev.hora}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded ${badgePrioridad(ev.prioridad)}`}>
                      {ev.prioridad}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => completar(ev.id)}
                    className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => cancelar(ev.id)}
                    className="bg-red-50 text-red-700 text-sm px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cards métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">👥</span>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total clientes</p>
          </div>
          <p className="text-xl font-medium text-gray-900">{stats.clientes}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">💰</span>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Ingresos totales</p>
          </div>
          <p className="text-xl font-medium text-blue-600">${formatCOP(stats.ingresos)}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">📈</span>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Ganancia neta</p>
          </div>
          <p className="text-xl font-medium text-green-600">${formatCOP(stats.ganancia)}</p>
          <p className="text-xs text-gray-300 mt-1">{margen}% margen</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">📦</span>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Costos totales</p>
          </div>
          <p className="text-xl font-medium text-red-500">${formatCOP(stats.ingresos - stats.ganancia)}</p>
          <p className="text-xs text-gray-300 mt-1">empaque incluido</p>
        </div>

      </div>

      {/* Gráfico */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-medium text-gray-800 mb-5">Ventas por mes</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ventasMes} barSize={40}>
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString('es-CO')}`, 'Ventas']}
              contentStyle={{ borderRadius: '8px', border: '0.5px solid #eee', fontSize: '13px' }}
            />
            <Bar dataKey="total" fill="#111" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default Dashboard;