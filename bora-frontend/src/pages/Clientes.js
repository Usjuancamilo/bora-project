import React, { useState, useEffect } from 'react';
import { clientesAPI } from '../services/api';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [clienteEdit, setClienteEdit] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', ciudad: '', notas: ''
  });

  useEffect(() => { cargarClientes(); }, []);

  const cargarClientes = async () => {
    try {
      const data = await clientesAPI.getAll();
      setClientes(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (clienteEdit) {
        await clientesAPI.update(clienteEdit.id, formData);
      } else {
        await clientesAPI.create(formData);
      }
      cerrarForm();
      cargarClientes();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cerrarForm = () => {
    setMostrarForm(false);
    setClienteEdit(null);
    setFormData({ nombre: '', telefono: '', ciudad: '', notas: '' });
  };

  const editarCliente = (cliente) => {
    setClienteEdit(cliente);
    setFormData(cliente);
    setMostrarForm(true);
  };

  const eliminarCliente = async (id) => {
    if (window.confirm('¿Eliminar este cliente?')) {
      await clientesAPI.delete(id);
      cargarClientes();
    }
  };

  const iniciales = (nombre) => {
    if (!nombre) return '?';
    return nombre.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  };

  const clientesFiltrados = clientes.filter(c => {
    const q = busqueda.toLowerCase();
    return (
      (c.nombre || '').toLowerCase().includes(q) ||
      (c.codigo || '').toLowerCase().includes(q) ||
      (c.ciudad || '').toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="p-6 text-sm text-gray-400">Cargando...</div>;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900 mb-1">Clientes</h1>
          <p className="text-sm text-gray-400">{clientes.length} clientes registrados</p>
        </div>
        <button
          onClick={() => mostrarForm ? cerrarForm() : setMostrarForm(true)}
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {mostrarForm ? '✕ Cancelar' : '+ Nuevo cliente'}
        </button>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
          <p className="text-sm font-medium text-gray-800 mb-4">
            {clienteEdit ? 'Editar cliente' : 'Nuevo cliente'}
          </p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input name="nombre" value={formData.nombre} onChange={handleChange}
                placeholder="Nombre completo" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
              <input name="telefono" value={formData.telefono} onChange={handleChange}
                placeholder="Teléfono"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
              <input name="ciudad" value={formData.ciudad} onChange={handleChange}
                placeholder="Ciudad"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
            </div>
            <textarea name="notas" value={formData.notas} onChange={handleChange}
              placeholder="Notas" rows="3"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300 mt-3 resize-y" />
            <button type="submit"
              className="mt-4 bg-green-700 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-green-800 transition-colors">
              {clienteEdit ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-gray-800">Listado de clientes</p>
        <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-36 text-gray-700"
          />
        </div>
      </div>

      {/* Tabla — solo desktop */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2.5 text-left text-xs text-gray-400 font-medium uppercase tracking-wide">Código</th>
              <th className="px-3 py-2.5 text-left text-xs text-gray-400 font-medium uppercase tracking-wide">Cliente</th>
              <th className="px-3 py-2.5 text-left text-xs text-gray-400 font-medium uppercase tracking-wide">Teléfono</th>
              <th className="px-3 py-2.5 text-left text-xs text-gray-400 font-medium uppercase tracking-wide">Ciudad</th>
              <th className="px-3 py-2.5 text-left text-xs text-gray-400 font-medium uppercase tracking-wide">Instagram</th>
              <th className="px-3 py-2.5 text-center text-xs text-gray-400 font-medium uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-sm text-gray-300">
                  No se encontraron clientes
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-xs text-gray-400">{c.codigo}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-500 shrink-0">
                        {iniciales(c.nombre)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{c.nombre}</div>
                        {c.notas && <div className="text-xs text-gray-400 mt-0.5">{c.notas.substring(0, 40)}{c.notas.length > 40 ? '...' : ''}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{c.telefono || <span className="text-gray-200">—</span>}</td>
                  <td className="px-3 py-3 text-gray-600">{c.ciudad || <span className="text-gray-200">—</span>}</td>
                  <td className="px-3 py-3">
                    {c.instagram
                      ? <span className="text-blue-500">@{c.instagram.replace('@', '')}</span>
                      : <span className="text-gray-200">—</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => editarCliente(c)}
                      className="border border-blue-200 text-blue-500 text-xs px-3 py-1 rounded-lg mr-2 hover:bg-blue-50 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => eliminarCliente(c.id)}
                      className="border border-red-200 text-red-500 text-xs px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tarjetas — solo móvil */}
      <div className="md:hidden flex flex-col gap-3">
        {clientesFiltrados.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-300">
            No se encontraron clientes
          </div>
        ) : (
          clientesFiltrados.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-sm font-medium text-blue-500 shrink-0">
                  {iniciales(c.nombre)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{c.nombre}</div>
                  {c.codigo && <div className="text-xs text-gray-400">{c.codigo}</div>}
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs text-gray-500 mb-3">
                {c.telefono && <span>📞 {c.telefono}</span>}
                {c.ciudad && <span>📍 {c.ciudad}</span>}
                {c.instagram && <span className="text-blue-500">@{c.instagram.replace('@', '')}</span>}
                {c.notas && <span className="text-gray-400 italic">{c.notas.substring(0, 60)}{c.notas.length > 60 ? '...' : ''}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => editarCliente(c)}
                  className="flex-1 border border-blue-200 text-blue-500 text-xs py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                  Editar
                </button>
                <button onClick={() => eliminarCliente(c.id)}
                  className="flex-1 border border-red-200 text-red-500 text-xs py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Clientes;