import React, { useState, useEffect } from 'react';
import { clientesAPI } from '../services/api';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [clienteEdit, setClienteEdit] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    //instagram: '',
    notas: ''
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
    setFormData({ nombre: '', 
      telefono: '', 
      ciudad: '', 
      //instagram: '', 
      notas: '' });
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

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '500' }}>Clientes</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>{clientes.length} clientes registrados</p>
        </div>
        <button
          onClick={() => mostrarForm ? cerrarForm() : setMostrarForm(true)}
          style={btnPrimario}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Nuevo cliente'}
        </button>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div style={{
          background: '#f8f8f8', border: '0.5px solid #e5e5e5',
          borderRadius: '12px', padding: '24px', marginBottom: '24px'
        }}>
          <p style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '500' }}>
            {clienteEdit ? 'Editar cliente' : 'Nuevo cliente'}
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/*}  <input name="codigo" value={formData.codigo} onChange={handleChange}
                placeholder="Código (ej: CLI-001)" required style={inputStyle} /> */}
              <input name="nombre" value={formData.nombre} onChange={handleChange}
                placeholder="Nombre completo" required style={inputStyle} />
              <input name="telefono" value={formData.telefono} onChange={handleChange}
                placeholder="Teléfono" style={inputStyle} />
              <input name="ciudad" value={formData.ciudad} onChange={handleChange}
                placeholder="Ciudad" style={inputStyle} />
              {/*<input name="instagram" value={formData.instagram} onChange={handleChange}
                placeholder="Instagram" style={inputStyle} /> */}
            </div>
            <textarea name="notas" value={formData.notas} onChange={handleChange}
              placeholder="Notas" rows="3"
              style={{ ...inputStyle, width: '100%', marginTop: '12px', resize: 'vertical', boxSizing: 'border-box' }} />
            <button type="submit" style={{ ...btnPrimario, marginTop: '16px', background: '#1e8c45' }}>
              {clienteEdit ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      {/* Tabla header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Listado de clientes</p>
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
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Teléfono</th>
              <th style={thStyle}>Ciudad</th>
              <th style={thStyle}>Instagram</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
                  No se encontraron clientes
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((c) => (
                <tr key={c.id} style={{ borderBottom: '0.5px solid #f0f0f0' }}>
                  <td style={{ ...tdStyle, color: '#999', fontSize: '12px' }}>{c.codigo}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={avatarStyle}>{iniciales(c.nombre)}</div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{c.nombre}</div>
                        {c.notas && <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{c.notas.substring(0, 40)}{c.notas.length > 40 ? '...' : ''}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>{c.telefono || <span style={{ color: '#ccc' }}>—</span>}</td>
                  <td style={tdStyle}>{c.ciudad || <span style={{ color: '#ccc' }}>—</span>}</td>
                  <td style={tdStyle}>
                    {c.instagram
                      ? <span style={{ color: '#1a7fe8' }}>@{c.instagram.replace('@', '')}</span>
                      : <span style={{ color: '#ccc' }}>—</span>}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button onClick={() => editarCliente(c)} style={btnEditar}>Editar</button>
                    <button onClick={() => eliminarCliente(c.id)} style={btnEliminar}>Eliminar</button>
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

const btnPrimario = {
  background: '#111', color: '#fff', border: 'none', borderRadius: '8px',
  padding: '8px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
};
const inputStyle = {
  padding: '10px 12px', borderRadius: '8px', border: '0.5px solid #ddd',
  fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box'
};
const searchBox = {
  display: 'flex', alignItems: 'center', gap: '8px',
  background: '#f5f5f5', border: '0.5px solid #ddd',
  borderRadius: '8px', padding: '6px 12px'
};
const thStyle = {
  padding: '10px 12px', textAlign: 'left', color: '#999',
  fontWeight: '500', fontSize: '11px',
  textTransform: 'uppercase', letterSpacing: '0.04em'
};
const tdStyle = { padding: '12px', verticalAlign: 'middle' };
const avatarStyle = {
  width: '32px', height: '32px', borderRadius: '50%',
  background: '#e8f0fd', display: 'flex', alignItems: 'center',
  justifyContent: 'center', fontSize: '12px', fontWeight: '500',
  color: '#1a7fe8', flexShrink: 0
};
const btnEditar = {
  background: 'transparent', border: '0.5px solid #b0d0f5',
  color: '#1a7fe8', borderRadius: '6px', padding: '4px 10px',
  fontSize: '12px', cursor: 'pointer', marginRight: '6px'
};
const btnEliminar = {
  background: 'transparent', border: '0.5px solid #f5a0a0',
  color: '#c0392b', borderRadius: '6px', padding: '4px 10px',
  fontSize: '12px', cursor: 'pointer'
};

export default Clientes;