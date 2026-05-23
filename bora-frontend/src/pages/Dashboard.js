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
    if (p === 'ALTA') return '#e74c3c';
    if (p === 'MEDIA') return '#f39c12';
    return '#27ae60';
  };

  const labelPrioridad = (p) => {
    if (p === 'ALTA') return { bg: '#fdeaea', color: '#c0392b' };
    if (p === 'MEDIA') return { bg: '#fef3e2', color: '#d68910' };
    return { bg: '#eaf6ee', color: '#1e8c45' };
  };

  const hoyStr = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const pendientesActivos = pendientesHoy.filter(e => !e.completado && !e.cancelado);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '500' }}>Dashboard</h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>Resumen general del negocio</p>
      </div>


  
      {/* Pendientes de hoy */}
      <div style={{ background: '#fff', border: '0.5px solid #e5e5e5', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '500' }}>Pendientes de hoy</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>{hoyStr}</p>
          </div>
          {pendientesActivos.length > 0 && (
            <span style={{ background: '#f0f0f0', color: '#555', fontSize: '12px', padding: '4px 10px', borderRadius: '20px' }}>
              {pendientesActivos.length} pendientes
            </span>
          )}
        </div>

        {pendientesActivos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#bbb', fontSize: '14px' }}>
            No tienes pendientes para hoy ✨
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendientesActivos.map(ev => {
              const { bg, color } = labelPrioridad(ev.prioridad);
              return (
                <div key={ev.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: '10px',
                  border: '0.5px solid #eee',
                  borderLeft: `3px solid ${colorPrioridad(ev.prioridad)}`
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '500' }}>{ev.titulo}</p>
                    {ev.descripcion && <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#888' }}>{ev.descripcion}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {ev.hora && <span style={{ fontSize: '11px', color: '#aaa' }}>⏰ {ev.hora}</span>}
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: bg, color }}>{ev.prioridad}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                    <button onClick={() => completar(ev.id)} style={btnCheck}>✓</button>
                    <button onClick={() => cancelar(ev.id)} style={btnX}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {/* Cards métricas */}
      
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'20px', marginTop:'20px', marginBottom:'40px'}}>
  
  <div style={{background: '#f8f8f8', borderRadius: '10px', padding: '16px'}}>
    <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
      <div style={{fontSize:'15px'}}>👥</div>
      <p style={labelStyle}>TOTAL CLIENTES</p>
    </div>
    <p style={valueStyle}>{stats.clientes}</p>
  </div>

  <div style={{background: '#f8f8f8', borderRadius: '10px', padding: '16px'}}>
    <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
      <div style={{fontSize:'15px'}}>💰</div>
      <p style={labelStyle}>INGRESOS TOTALES</p>
    </div>
    <p style={{ ...valueStyle, color: '#1a7fe8' }}>${formatCOP(stats.ingresos)}</p>
  </div>

  <div style={{background: '#f8f8f8', borderRadius: '10px', padding: '16px'}}>
    <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
      <div style={{fontSize:'15px'}}>📈</div>
      <p style={labelStyle}>GANANCIA NETA</p>
    </div>
    <p style={{ ...valueStyle, color: '#1e8c45' }}>${formatCOP(stats.ganancia)}</p>
    <p style={hintStyle}>{margen}% margen</p>
  </div>

  <div style={{background: '#f8f8f8', borderRadius: '10px', padding: '16px'}}>
    <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
      <div style={{fontSize:'15px'}}>📦</div>
      <p style={labelStyle}>COSTOS TOTALES</p>
    </div>
    <p style={{...valueStyle, color:'#dc3545'}}>${formatCOP(stats.ingresos - stats.ganancia)}</p>
    <p style={hintStyle}>empaque incluido</p>
  </div>

</div>



      {/* Gráfico */}
      <div style={{ background: '#fff', border: '0.5px solid #e5e5e5', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <p style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '500' }}>Ventas por mes</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ventasMes} barSize={40}>
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString('es-CO')}`, 'Ventas']} contentStyle={{ borderRadius: '8px', border: '0.5px solid #eee', fontSize: '13px' }} />
            <Bar dataKey="total" fill="#111" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      
    </div>
  );
}

//<div style={{background:'#fff', padding:'30px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>   este codigo es un card con efecto borde y sombra, moderno.
<div style={cardStyle}>
  contenido
</div>
const cardStyle = { background: '#f8f8f8', borderRadius: '10px', padding: '16px' };
const labelStyle = { margin: '0 0 6px', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' };
const valueStyle = { margin: 0, fontSize: '22px', fontWeight: '500', color: '#111' };
const hintStyle = { margin: '4px 0 0', fontSize: '12px', color: '#aaa' };
const btnCheck = { background: '#eaf6ee', color: '#1e8c45', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' };
const btnX = { background: '#fdeaea', color: '#c0392b', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '13px' };

export default Dashboard;