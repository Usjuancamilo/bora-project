import React, { useState, useEffect } from 'react';
import { ventasAPI, clientesAPI } from '../services/api';

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: '', costoProducto: '', empaqueInsumos: '',
    precioVenta: '', fecha: new Date().toISOString().split('T')[0], cliente: null
  });
  const [clienteId, setClienteId] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [clienteBusqueda, setClienteBusqueda] = useState('');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [dataVentas, dataClientes] = await Promise.all([
        ventasAPI.getAll(), clientesAPI.getAll()
      ]);
      setVentas(dataVentas);
      setClientes(dataClientes);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
      descripcion: '', costoProducto: '', empaqueInsumos: '',
      precioVenta: '', fecha: new Date().toISOString().split('T')[0], cliente: null
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
    if (!cliente?.nombre) return '?';
    return cliente.nombre.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatCOP = (valor) => Number(valor || 0).toLocaleString('es-CO');

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const calcularMargen = (v) => {
    const venta = Number(v.precioVenta || 0);
    if (venta === 0) return 0;
    return Math.round((Number(v.ganancia || 0) / venta) * 100);
  };

  const calcularCostoTotal = (v) =>
    Number(v.costoProducto || 0) + Number(v.empaqueInsumos || 0);

  const costoTotal = Number(formData.costoProducto || 0) + Number(formData.empaqueInsumos || 0);
  const gananciaPreview = Number(formData.precioVenta || 0) - costoTotal;
  const margenPreview = Number(formData.precioVenta || 0) > 0
    ? Math.round((gananciaPreview / Number(formData.precioVenta)) * 100) : 0;

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

  if (loading) return <div className="p-6 text-sm text-gray-400">Cargando...</div>;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900 mb-1">Ventas</h1>
          <p className="text-sm text-gray-400">{ventas.length} ventas registradas</p>
        </div>
        <button onClick={() => setMostrarForm(true)}
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          + Nueva venta
        </button>
      </div>

      {/* Cards métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Ventas totales</p>
          <p className="text-xl font-medium text-gray-900">{ventas.length}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Ingresos totales</p>
          <p className="text-xl font-medium text-blue-600">${formatCOP(totalIngresos)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Costos totales</p>
          <p className="text-xl font-medium text-gray-900">${formatCOP(totalCostos)}</p>
          <p className="text-xs text-gray-300 mt-1">empaque incluido</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Ganancia neta</p>
          <p className="text-xl font-medium text-green-600">${formatCOP(totalGanancia)}</p>
          <p className="text-xs text-gray-300 mt-1">{margenGeneral}% margen</p>
        </div>
      </div>

      {/* Modal nueva venta */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-screen overflow-y-auto shadow-xl">

            <div className="flex justify-between items-center mb-5">
              <p className="text-base font-medium text-gray-900">Nueva venta</p>
              <button onClick={cerrarForm} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Descripción */}
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Producto / descripción</label>
                <input name="descripcion" value={formData.descripcion} onChange={handleChange}
                  placeholder="Ej: Tacones negros" required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
              </div>

              {/* Cliente autocomplete */}
              <div className="mb-4 relative">
                <label className="block text-xs text-gray-500 mb-1">Cliente</label>
                <input type="text" placeholder="Buscar cliente..."
                  value={clienteBusqueda}
                  onChange={e => { setClienteBusqueda(e.target.value); setClienteId(''); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                  autoComplete="off" />
                {clienteBusqueda && clienteId === '' && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-44 overflow-y-auto">
                    {clientes.filter(c =>
                      c.nombre.toLowerCase().includes(clienteBusqueda.toLowerCase()) ||
                      c.codigo.toLowerCase().includes(clienteBusqueda.toLowerCase())
                    ).map(c => (
                      <div key={c.id}
                        onClick={() => { setClienteId(String(c.id)); setClienteBusqueda(`${c.nombre} (${c.codigo})`); }}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 border-b border-gray-50 text-sm">
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-500 shrink-0">
                          {c.nombre.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{c.nombre}</div>
                          <div className="text-xs text-gray-400">{c.codigo}</div>
                        </div>
                      </div>
                    ))}
                    {clientes.filter(c =>
                      c.nombre.toLowerCase().includes(clienteBusqueda.toLowerCase()) ||
                      c.codigo.toLowerCase().includes(clienteBusqueda.toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-400">No se encontró ningún cliente</div>
                    )}
                  </div>
                )}
              </div>

              {/* Costos */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Costo del producto</label>
                  <input name="costoProducto" type="number" value={formData.costoProducto}
                    onChange={handleChange} placeholder="0" required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Empaque / insumos</label>
                  <input name="empaqueInsumos" type="number" value={formData.empaqueInsumos}
                    onChange={handleChange} placeholder="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
              </div>

              {/* Precio y fecha */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Precio de venta</label>
                  <input name="precioVenta" type="number" value={formData.precioVenta}
                    onChange={handleChange} placeholder="0" required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha</label>
                  <input name="fecha" type="date" value={formData.fecha}
                    onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
              </div>

              {/* Preview ganancia */}
              {formData.precioVenta > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Ganancia estimada</p>
                    <p className={`text-xl font-medium mt-0.5 ${gananciaPreview >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ${formatCOP(gananciaPreview)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Margen</p>
                    <p className={`text-xl font-medium mt-0.5 ${margenPreview >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {margenPreview}%
                    </p>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={cerrarForm}
                  className="border border-gray-200 text-gray-500 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  className={`bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors ${guardando ? 'opacity-60' : ''}`}>
                  {guardando ? 'Guardando...' : 'Guardar venta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-gray-800">Historial de ventas</p>
        <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5">
          <span className="text-gray-400 text-sm">🔍</span>
          <input type="text" placeholder="Buscar..." value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-32 text-gray-700" />
        </div>
      </div>

      {/* Tabla — solo desktop */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2.5 text-left text-xs text-gray-400 font-medium uppercase tracking-wide">Código</th>
              <th className="px-3 py-2.5 text-left text-xs text-gray-400 font-medium uppercase tracking-wide">Producto</th>
              <th className="px-3 py-2.5 text-left text-xs text-gray-400 font-medium uppercase tracking-wide">Cliente</th>
              <th className="px-3 py-2.5 text-right text-xs text-gray-400 font-medium uppercase tracking-wide">Costo</th>
              <th className="px-3 py-2.5 text-right text-xs text-gray-400 font-medium uppercase tracking-wide">Venta</th>
              <th className="px-3 py-2.5 text-right text-xs text-gray-400 font-medium uppercase tracking-wide">Ganancia</th>
              <th className="px-3 py-2.5 text-center text-xs text-gray-400 font-medium uppercase tracking-wide">Margen</th>
              <th className="px-3 py-2.5 text-center text-xs text-gray-400 font-medium uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.length === 0 ? (
              <tr><td colSpan="8" className="py-10 text-center text-sm text-gray-300">No se encontraron ventas</td></tr>
            ) : ventasFiltradas.map((v) => (
              <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-3 py-3 text-xs text-gray-400">{v.codigo}</td>
                <td className="px-3 py-3">
                  <div className="font-medium text-gray-800">{v.descripcion}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatFecha(v.fecha)}</div>
                </td>
                <td className="px-3 py-3">
                  {v.cliente ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-500 shrink-0">
                        {iniciales(v.cliente)}
                      </div>
                      <div>
                        <div className="text-sm text-gray-800">{v.cliente.nombre}</div>
                        <div className="text-xs text-gray-400">{v.cliente.codigo}</div>
                      </div>
                    </div>
                  ) : <span className="text-gray-200">—</span>}
                </td>
                <td className="px-3 py-3 text-right text-gray-600">${formatCOP(calcularCostoTotal(v))}</td>
                <td className="px-3 py-3 text-right text-gray-600">${formatCOP(v.precioVenta)}</td>
                <td className="px-3 py-3 text-right font-medium text-green-600">${formatCOP(v.ganancia)}</td>
                <td className="px-3 py-3 text-center">
                  <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-md font-medium">
                    {calcularMargen(v)}%
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <button onClick={() => eliminar(v.id)}
                    className="border border-red-200 text-red-500 text-xs px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas — solo móvil */}
      <div className="md:hidden flex flex-col gap-3">
        {ventasFiltradas.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-300">No se encontraron ventas</div>
        ) : ventasFiltradas.map((v) => (
          <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-sm font-medium text-gray-800">{v.descripcion}</div>
                <div className="text-xs text-gray-400 mt-0.5">{formatFecha(v.fecha)}</div>
              </div>
              <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-md font-medium">
                {calcularMargen(v)}%
              </span>
            </div>
            {v.cliente && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-500 shrink-0">
                  {iniciales(v.cliente)}
                </div>
                <span className="text-xs text-gray-500">{v.cliente.nombre}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400 mb-0.5">Costo</div>
                <div className="font-medium text-gray-700">${formatCOP(calcularCostoTotal(v))}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400 mb-0.5">Venta</div>
                <div className="font-medium text-blue-600">${formatCOP(v.precioVenta)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400 mb-0.5">Ganancia</div>
                <div className="font-medium text-green-600">${formatCOP(v.ganancia)}</div>
              </div>
            </div>
            <button onClick={() => eliminar(v.id)}
              className="w-full border border-red-200 text-red-500 text-xs py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              Eliminar
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Ventas;