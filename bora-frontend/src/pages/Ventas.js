import React, { useState, useEffect } from 'react';
import { ventasAPI, clientesAPI } from '../services/api';

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: '',
    costoProducto: '',
    empaqueInsumos: '',
    precioVenta: '',
    fecha: new Date().toISOString().split('T')[0],
    cliente: null
  });
  const [clienteId, setClienteId] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [clienteBusqueda, setClienteBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [dataVentas, dataClientes] = await Promise.all([
        ventasAPI.getAll(),
        clientesAPI.getAll()
      ]);
      setVentas(dataVentas);
      setClientes(dataClientes);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const clienteSeleccionado = clientes.find(c => c.id === Number(clienteId));
      const nuevaVenta = {
        ...formData,
        costoProducto: Number(formData.costoProducto),
        empaqueInsumos: Number(formData.empaqueInsumos || 0),
        precioVenta: Number(formData.precioVenta),
        cliente: clienteSeleccionado || null
      };
      await ventasAPI.create(nuevaVenta);
      cerrarForm();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
    setGuardando(false);
  };

  const cerrarForm = () => {
    setMostrarForm(false);
    setClienteBusqueda('');
    setFormData({
      descripcion: '',
      costoProducto: '',
      empaqueInsumos: '',
      precioVenta: '',
      fecha: new Date().toISOString().split('T')[0],
      cliente: null
    });
    setClienteId('');
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Eliminar esta venta?')) {
      await ventasAPI.delete(id);
      cargarDatos();
    }
  };

  const iniciales = (cliente) => {
    if (!cliente || !cliente.nombre) return '?';
    return cliente.nombre.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatCOP = (valor) => Number(valor || 0).toLocaleString('es-CO');

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calcularMargen = (v) => {
    const ganancia = Number(v.ganancia || 0);
    const venta = Number(v.precioVenta || 0);
    if (venta === 0) return 0;
    return Math.round((ganancia / venta) * 100);
  };

  const calcularCostoTotal = (v) =>
    Number(v.costoProducto || 0) + Number(v.empaqueInsumos || 0);

  // Preview en tiempo real del formulario
  const costoTotal = Number(formData.costoProducto || 0) + Number(formData.empaqueInsumos || 0);
  const gananciaPreview = Number(formData.precioVenta || 0) - costoTotal;
  const margenPreview = Number(formData.precioVenta || 0) > 0
    ? Math.round((gananciaPreview / Number(formData.precioVenta)) * 100)
    : 0;

  // Métricas
  const totalIngresos = ventas.reduce((sum, v) => sum + Number(v.precioVenta || 0), 0);
  const totalCostos = ventas.reduce((sum, v) => sum + calcularCostoTotal(v), 0);
  const totalGanancia = ventas.reduce((sum, v) => sum + Number(v.ganancia || 0), 0);
  const margenGeneral = totalIngresos > 0 ? Math.round((totalGanancia / totalIngresos) * 100) : 0;

  const ventasFiltradas = ventas.filter(v => {
    const q = busqueda.toLowerCase();
    return (
      (v.descripcion || '').toLowerCase().includes(q) ||
      (v.codigo || '').toLowerCase().includes(q) ||
      (v.cliente?.nombre || '').toLowerCase().includes(q)
    );
  });

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '500' }}>Ventas</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>{ventas.length} ventas registradas</p>
        </div>
        <button onClick={() => setMostrarForm(true)} style={btnPrimario}>
          + Nueva venta
        </button>
      </div>

      {/* Cards métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <p style={labelStyle}>VENTAS TOTALES</p>
          <p style={valueStyle}>{ventas.length}</p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>INGRESOS TOTALES</p>
          <p style={{ ...valueStyle, color: '#1a7fe8' }}>${formatCOP(totalIngresos)}</p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>COSTOS TOTALES</p>
          <p style={valueStyle}>${formatCOP(totalCostos)}</p>
          <p style={hintStyle}>empaque incluido</p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>GANANCIA NETA</p>
          <p style={{ ...valueStyle, color: '#1e8c45' }}>${formatCOP(totalGanancia)}</p>
          <p style={hintStyle}>{margenGeneral}% margen</p>
        </div>
      </div>

      {/* Modal nueva venta */}
      {mostrarForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '28px',
            width: '100%', maxWidth: '520px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>Nueva venta</p>
              <button onClick={cerrarForm} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Producto */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelFormStyle}>Producto / descripción</label>
                <input
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Ej: Tacones negros"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Cliente */}
              
              {/* Cliente con autocomplete */}
<div style={{ marginBottom: '14px', position: 'relative' }}>
  <label style={labelFormStyle}>Cliente</label>
  <input
    type="text"
    placeholder="Buscar cliente..."
    value={clienteBusqueda}
    onChange={e => {
      setClienteBusqueda(e.target.value);
      setClienteId('');
    }}
    style={inputStyle}
    autoComplete="off"
  />
  {clienteBusqueda && clienteId === '' && (
    <div style={{
      position: 'absolute', top: '100%', left: 0, right: 0,
      background: '#fff', border: '0.5px solid #ddd', borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '180px', overflowY: 'auto'
    }}>
      {clientes
        .filter(c =>
          c.nombre.toLowerCase().includes(clienteBusqueda.toLowerCase()) ||
          c.codigo.toLowerCase().includes(clienteBusqueda.toLowerCase())
        )
        .map(c => (
          <div
            key={c.id}
            onClick={() => {
              setClienteId(String(c.id));
              setClienteBusqueda(`${c.nombre} (${c.codigo})`);
            }}
            style={{
              padding: '10px 14px', cursor: 'pointer', fontSize: '13px',
              borderBottom: '0.5px solid #f0f0f0', display: 'flex',
              alignItems: 'center', gap: '10px'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8f8f8'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#e8f0fd', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '11px', fontWeight: '500', color: '#1a7fe8', flexShrink: 0
            }}>
              {c.nombre.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '500' }}>{c.nombre}</div>
              <div style={{ fontSize: '11px', color: '#aaa' }}>{c.codigo}</div>
            </div>
          </div>
        ))
      }
      {clientes.filter(c =>
        c.nombre.toLowerCase().includes(clienteBusqueda.toLowerCase()) ||
        c.codigo.toLowerCase().includes(clienteBusqueda.toLowerCase())
      ).length === 0 && (
        <div style={{ padding: '12px 14px', fontSize: '13px', color: '#aaa' }}>
          No se encontró ningún cliente
        </div>
      )}
    </div>
  )}
</div>




              {/* Costos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={labelFormStyle}>Costo del producto</label>
                  <input
                    name="costoProducto"
                    type="number"
                    value={formData.costoProducto}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelFormStyle}>Empaque / insumos</label>
                  <input
                    name="empaqueInsumos"
                    type="number"
                    value={formData.empaqueInsumos}
                    onChange={handleChange}
                    placeholder="0"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Precio venta y fecha */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={labelFormStyle}>Precio de venta</label>
                  <input
                    name="precioVenta"
                    type="number"
                    value={formData.precioVenta}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelFormStyle}>Fecha</label>
                  <input
                    name="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Preview ganancia */}
              {formData.precioVenta > 0 && (
                <div style={{
                  background: '#f0faf4', border: '0.5px solid #c3e6cb',
                  borderRadius: '8px', padding: '12px 16px', marginBottom: '20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ganancia estimada</p>
                    <p style={{ margin: '2px 0 0', fontSize: '20px', fontWeight: '500', color: gananciaPreview >= 0 ? '#1e8c45' : '#c0392b' }}>
                      ${formatCOP(gananciaPreview)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Margen</p>
                    <p style={{ margin: '2px 0 0', fontSize: '20px', fontWeight: '500', color: margenPreview >= 0 ? '#1e8c45' : '#c0392b' }}>
                      {margenPreview}%
                    </p>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={cerrarForm} style={btnCancelar}>Cancelar</button>
                <button type="submit" disabled={guardando} style={{ ...btnPrimario, opacity: guardando ? 0.7 : 1 }}>
                  {guardando ? 'Guardando...' : 'Guardar venta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Historial de ventas</p>
        <div style={searchBox}>
          <span style={{ color: '#aaa', fontSize: '14px' }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '160px', color: '#333' }}
          />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', border: '0.5px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8f8f8', borderBottom: '0.5px solid #eee' }}>
              <th style={thStyle}>Código</th>
              <th style={thStyle}>Producto</th>
              <th style={thStyle}>Cliente</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Costo</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Venta</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Ganancia</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Margen</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
                  No se encontraron ventas
                </td>
              </tr>
            ) : (
              ventasFiltradas.map((v) => (
                <tr key={v.id} style={{ borderBottom: '0.5px solid #f0f0f0' }}>
                  <td style={{ ...tdStyle, color: '#999', fontSize: '12px' }}>{v.codigo}</td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '500' }}>{v.descripcion}</div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{formatFecha(v.fecha)}</div>
                  </td>
                  <td style={tdStyle}>
                    {v.cliente ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={avatarStyle}>{iniciales(v.cliente)}</div>
                        <div>
                          <div style={{ fontSize: '13px' }}>{v.cliente.nombre}</div>
                          <div style={{ fontSize: '11px', color: '#aaa' }}>{v.cliente.codigo}</div>
                        </div>
                      </div>
                    ) : <span style={{ color: '#ccc' }}>—</span>}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>${formatCOP(calcularCostoTotal(v))}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>${formatCOP(v.precioVenta)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#1e8c45', fontWeight: '500' }}>${formatCOP(v.ganancia)}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={margenBadge}>{calcularMargen(v)}%</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button onClick={() => eliminar(v.id)} style={btnEliminar}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const btnPrimario = { background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' };
const btnCancelar = { background: 'transparent', border: '0.5px solid #ddd', color: '#666', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' };
const cardStyle = { background: '#f8f8f8', borderRadius: '8px', padding: '16px' };
const labelStyle = { margin: '0 0 6px', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' };
const valueStyle = { margin: 0, fontSize: '22px', fontWeight: '500', color: '#111' };
const hintStyle = { margin: '4px 0 0', fontSize: '12px', color: '#aaa' };
const labelFormStyle = { display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid #ddd', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const searchBox = { display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', border: '0.5px solid #ddd', borderRadius: '8px', padding: '6px 12px' };
const thStyle = { padding: '10px 12px', textAlign: 'left', color: '#999', fontWeight: '500', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' };
const tdStyle = { padding: '12px', verticalAlign: 'middle' };
const avatarStyle = { width: '32px', height: '32px', borderRadius: '50%', background: '#e8f0fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '500', color: '#1a7fe8', flexShrink: 0 };
const margenBadge = { display: 'inline-block', background: '#eaf6ee', color: '#1e8c45', fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: '500' };
const btnEliminar = { background: 'transparent', border: '0.5px solid #f5a0a0', color: '#c0392b', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' };

export default Ventas;