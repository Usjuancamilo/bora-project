import React, { useEffect, useState, useRef, useMemo } from 'react';
import { eventosAPI } from '../services/api';

// Festivos Colombia — fuera del componente
const getFestivos = (anio) => {
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mesPascua = Math.floor((h + l - 7 * m + 114) / 31);
  const diaPascua = ((h + l - 7 * m + 114) % 31) + 1;
  const pascua = new Date(anio, mesPascua - 1, diaPascua);

  const juevesSanto = new Date(pascua); juevesSanto.setDate(pascua.getDate() - 3);
  const viernesSanto = new Date(pascua); viernesSanto.setDate(pascua.getDate() - 2);

  const siguienteLunes = (fecha) => {
    const d = new Date(fecha);
    const dia = d.getDay();
    if (dia === 1) return d;
    d.setDate(d.getDate() + (dia === 0 ? 1 : 8 - dia));
    return d;
  };

  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const reyes        = siguienteLunes(new Date(anio, 0, 6));
  const sanJose      = siguienteLunes(new Date(anio, 2, 19));
  const ascension    = new Date(pascua); ascension.setDate(pascua.getDate() + 39);
  const ascencionL   = siguienteLunes(ascension);
  const corpusCristi = new Date(pascua); corpusCristi.setDate(pascua.getDate() + 60);
  const corpusL      = siguienteLunes(corpusCristi);
  const sagradoC     = new Date(pascua); sagradoC.setDate(pascua.getDate() + 68);
  const sagradoCL    = siguienteLunes(sagradoC);
  const sanPedro     = siguienteLunes(new Date(anio, 5, 29));
  const asuncion     = siguienteLunes(new Date(anio, 7, 15));
  const colomboDesc  = siguienteLunes(new Date(anio, 9, 12));
  const todosLos     = siguienteLunes(new Date(anio, 10, 1));
  const independCart = siguienteLunes(new Date(anio, 10, 11));

  return {
    [fmt(new Date(anio, 0, 1))]:   'Año Nuevo',
    [fmt(new Date(anio, 4, 1))]:   'Día del Trabajo',
    [fmt(new Date(anio, 5, 20))]:  'Día de la Independencia',
    [fmt(new Date(anio, 6, 20))]:  'Batalla de Boyacá',
    [fmt(new Date(anio, 11, 8))]:  'Inmaculada Concepción',
    [fmt(new Date(anio, 11, 25))]: 'Navidad',
    [fmt(juevesSanto)]:  'Jueves Santo',
    [fmt(viernesSanto)]: 'Viernes Santo',
    [fmt(reyes)]:        'Reyes Magos',
    [fmt(sanJose)]:      'San José',
    [fmt(ascencionL)]:   'Ascensión del Señor',
    [fmt(corpusL)]:      'Corpus Christi',
    [fmt(sagradoCL)]:    'Sagrado Corazón',
    [fmt(sanPedro)]:     'San Pedro y San Pablo',
    [fmt(asuncion)]:     'Asunción de la Virgen',
    [fmt(colomboDesc)]:  'Día de la Raza',
    [fmt(todosLos)]:     'Todos los Santos',
    [fmt(independCart)]: 'Independencia de Cartagena',
  };
};

function Calendario() {
  const hoy = new Date();
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoy.getDate());
  const [eventos, setEventos] = useState([]);
  const [eventosDia, setEventosDia] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [eventoEditando, setEventoEditando] = useState(null);
  const menuRef = useRef(null);

  const [formData, setFormData] = useState({
    titulo: '', descripcion: '',
    fecha: hoy.toISOString().split('T')[0],
    hora: '', prioridad: 'MEDIA'
  });

  const [formEdit, setFormEdit] = useState({
    titulo: '', descripcion: '', fecha: '', hora: '', prioridad: 'MEDIA'
  });

  const festivos = useMemo(() => getFestivos(anioActual), [anioActual]);

  const formatFechaISO = (anio, mes, dia) => {
    const m = String(mes + 1).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    return `${anio}-${m}-${d}`;
  };

  useEffect(() => { cargarEventos(); }, [mesActual, anioActual]);

  useEffect(() => {
    const fechaStr = formatFechaISO(anioActual, mesActual, diaSeleccionado);
    setEventosDia(eventos.filter(e => e.fecha === fechaStr));
  }, [diaSeleccionado, eventos, mesActual, anioActual]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const cargarEventos = async () => {
    try {
      const data = await eventosAPI.getAll();
      setEventos(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
  const primerDia = new Date(anioActual, mesActual, 1).getDay();
  const offset = primerDia === 0 ? 6 : primerDia - 1;

  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const diasSemana = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  const mesAnterior = () => {
    if (mesActual === 0) { setMesActual(11); setAnioActual(a => a - 1); }
    else setMesActual(m => m - 1);
  };
  const mesSiguiente = () => {
    if (mesActual === 11) { setMesActual(0); setAnioActual(a => a + 1); }
    else setMesActual(m => m + 1);
  };
  const irAHoy = () => {
    setMesActual(hoy.getMonth());
    setAnioActual(hoy.getFullYear());
    setDiaSeleccionado(hoy.getDate());
  };

  const eventosDelDia = (dia) => {
    const fechaStr = formatFechaISO(anioActual, mesActual, dia);
    return eventos.filter(e => e.fecha === fechaStr && !e.cancelado);
  };

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

  const completar = async (id) => { await eventosAPI.completar(id); cargarEventos(); };
  const cancelar  = async (id) => { await eventosAPI.cancelar(id);  cargarEventos(); };

  const abrirEdicion = (ev) => {
    setMenuAbierto(null);
    setEventoEditando(ev);
    setFormEdit({
      titulo: ev.titulo || '', descripcion: ev.descripcion || '',
      fecha: ev.fecha || '', hora: ev.hora || '', prioridad: ev.prioridad || 'MEDIA'
    });
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formEdit, hora: formEdit.hora?.trim() !== '' ? formEdit.hora : null };
      await eventosAPI.update(eventoEditando.id, payload);
      setEventoEditando(null);
      cargarEventos();
    } catch (error) { console.error('Error actualizando:', error); }
  };

  const handleChange     = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setFormEdit({ ...formEdit, [e.target.name]: e.target.value });

  const guardarEvento = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, hora: formData.hora?.trim() !== '' ? formData.hora : null };
      await eventosAPI.create(payload);
      setMostrarForm(false);
      setFormData({ titulo: '', descripcion: '', fecha: hoy.toISOString().split('T')[0], hora: '', prioridad: 'MEDIA' });
      cargarEventos();
    } catch (error) { console.error('Error:', error); }
  };

  const esHoy = (dia) =>
    dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear();

  const fechaDiaSeleccionado = new Date(anioActual, mesActual, diaSeleccionado)
    .toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const celdas = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '500' }}>Calendario</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>Gestiona tus eventos y pendientes</p>
        </div>
        <button onClick={() => setMostrarForm(true)} style={btnPrimario}>+ Nuevo evento</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

        {/* Calendario */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={mesAnterior} style={btnNav}>‹</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: '500' }}>{meses[mesActual]} {anioActual}</span>
              <button onClick={irAHoy} style={btnHoy}>Hoy</button>
            </div>
            <button onClick={mesSiguiente} style={btnNav}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
            {diasSemana.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '12px', color: '#999', fontWeight: '500', padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {celdas.map((dia, idx) => {
              if (!dia) return <div key={`e-${idx}`} />;
              const evDia = eventosDelDia(dia);
              const seleccionado = dia === diaSeleccionado;
              const hoyDia = esHoy(dia);
              const fechaCelda = formatFechaISO(anioActual, mesActual, dia);
              const esFestivo = !!festivos[fechaCelda];
              return (
                <div key={dia} onClick={() => setDiaSeleccionado(dia)}
                  style={{
                    minHeight: '64px', padding: '6px', borderRadius: '8px', cursor: 'pointer',
                    background: seleccionado ? '#111' : hoyDia ? '#f0f0f0' : esFestivo ? '#ffe2ff82' : 'transparent',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => { if (!seleccionado) e.currentTarget.style.background = '#f8f8f8'; }}
                  onMouseLeave={e => { if (!seleccionado) e.currentTarget.style.background = hoyDia ? '#f0f0f0' : esFestivo ? '#ffe2ff82' : 'transparent'; }}
                >
                  <div style={{ fontSize: '13px', fontWeight: hoyDia ? '600' : '400', color: seleccionado ? '#fff' : esFestivo ? '#D38BCE' : '#333', marginBottom: '4px', textAlign: 'center' }}>
                    {dia}
                  </div>
                  {esFestivo && !seleccionado && (
                    <div style={{ fontSize: '9px', color: 'hsl(304 45 69)', textAlign: 'center', lineHeight: 1.2, marginBottom: '2px' }}>
                      {festivos[fechaCelda].split(' ').slice(0, 2).join(' ')}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2px' }}>
                    {evDia.slice(0, 3).map(ev => (
                      <div key={ev.id} style={{ width: '6px', height: '6px', borderRadius: '50%', background: seleccionado ? '#fff' : colorPrioridad(ev.prioridad) }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel lateral */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '500' }}>Eventos del día</p>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>{fechaDiaSeleccionado}</p>

          {festivos[formatFechaISO(anioActual, mesActual, diaSeleccionado)] && (
            <div style={{ background: '#ffe2ff82', border: '0.5px solid #ffe2ff82', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>🎉</span>
              <span style={{ fontSize: '12px', color: '#955594', fontWeight: '500' }}>
                {festivos[formatFechaISO(anioActual, mesActual, diaSeleccionado)]}
              </span>
            </div>
          )}

          {eventosDia.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb', fontSize: '13px' }}>Sin eventos este día</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} ref={menuRef}>
              {eventosDia.map(ev => {
                const { bg, color } = labelPrioridad(ev.prioridad);
                return (
                  <div key={ev.id} style={{ border: '0.5px solid #eee', borderRadius: '10px', padding: '12px', opacity: ev.completado ? 0.5 : 1, borderLeft: `3px solid ${colorPrioridad(ev.prioridad)}`, position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '500', textDecoration: ev.completado ? 'line-through' : 'none' }}>{ev.titulo}</p>
                        {ev.descripcion && <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#888' }}>{ev.descripcion}</p>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {ev.hora && <span style={{ fontSize: '11px', color: '#aaa' }}>⏰ {ev.hora}</span>}
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: bg, color }}>{ev.prioridad}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginLeft: '8px', alignItems: 'center' }}>
                        {!ev.completado && !ev.cancelado && (
                          <>
                            <button onClick={() => completar(ev.id)} style={btnCheck}>✓</button>
                            <button onClick={() => cancelar(ev.id)} style={btnX}>✕</button>
                          </>
                        )}
                        {!ev.completado && (
                          <div style={{ position: 'relative' }}>
                            <button onClick={() => setMenuAbierto(menuAbierto === ev.id ? null : ev.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#aaa', padding: '2px 6px', borderRadius: '4px' }}>
                              ⋮
                            </button>
                            {menuAbierto === ev.id && (
                              <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 100, background: '#fff', border: '0.5px solid #e5e5e5', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: '130px', overflow: 'hidden' }}>
                                <div onClick={() => abrirEdicion(ev)}
                                  style={{ padding: '10px 14px', fontSize: '13px', cursor: 'pointer', color: '#333' }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f8f8f8'}
                                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                                  ✏️ Editar evento
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal nuevo evento */}
      {mostrarForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>Nuevo evento</p>
              <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>
            <form onSubmit={guardarEvento}>
              <label style={labelFormStyle}>Título</label>
              <input name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej: Empacar pedido" required style={inputStyle} />
              <label style={labelFormStyle}>Descripción</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Detalle opcional" rows="3" style={{ ...inputStyle, resize: 'vertical' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={labelFormStyle}>Fecha</label><input name="fecha" type="date" value={formData.fecha} onChange={handleChange} required style={inputStyle} /></div>
                <div><label style={labelFormStyle}>Hora</label><input name="hora" type="time" value={formData.hora} onChange={handleChange} style={inputStyle} /></div>
              </div>
              <label style={labelFormStyle}>Prioridad</label>
              <select name="prioridad" value={formData.prioridad} onChange={handleChange} style={inputStyle}>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" onClick={() => setMostrarForm(false)} style={btnCancelar}>Cancelar</button>
                <button type="submit" style={btnPrimario}>Guardar evento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar evento */}
      {eventoEditando && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>Editar evento</p>
              <button onClick={() => setEventoEditando(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>
            <form onSubmit={guardarEdicion}>
              <label style={labelFormStyle}>Título</label>
              <input name="titulo" value={formEdit.titulo} onChange={handleEditChange} required style={inputStyle} />
              <label style={labelFormStyle}>Descripción</label>
              <textarea name="descripcion" value={formEdit.descripcion} onChange={handleEditChange} rows="3" style={{ ...inputStyle, resize: 'vertical' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={labelFormStyle}>Fecha</label><input name="fecha" type="date" value={formEdit.fecha} onChange={handleEditChange} required style={inputStyle} /></div>
                <div><label style={labelFormStyle}>Hora</label><input name="hora" type="time" value={formEdit.hora} onChange={handleEditChange} style={inputStyle} /></div>
              </div>
              <label style={labelFormStyle}>Prioridad</label>
              <select name="prioridad" value={formEdit.prioridad} onChange={handleEditChange} style={inputStyle}>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" onClick={() => setEventoEditando(null)} style={btnCancelar}>Cancelar</button>
                <button type="submit" style={btnPrimario}>Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const btnPrimario    = { background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' };
const btnCancelar    = { background: 'transparent', border: '0.5px solid #ddd', color: '#666', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' };
const btnNav         = { background: 'transparent', border: '0.5px solid #e5e5e5', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '18px', color: '#555' };
const btnHoy         = { background: 'transparent', border: '0.5px solid #ddd', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px', color: '#555' };
const btnCheck       = { background: '#eaf6ee', color: '#1e8c45', border: 'none', borderRadius: '6px', padding: '5px 9px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' };
const btnX           = { background: '#fdeaea', color: '#c0392b', border: 'none', borderRadius: '6px', padding: '5px 9px', cursor: 'pointer', fontSize: '13px' };
const inputStyle     = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid #ddd', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '14px' };
const labelFormStyle = { display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' };

export default Calendario;