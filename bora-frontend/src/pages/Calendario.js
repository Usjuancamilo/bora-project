import React, { useEffect, useState, useRef, useMemo } from 'react';
import { eventosAPI } from '../services/api';

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
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const cargarEventos = async () => {
    try {
      const data = await eventosAPI.getAll();
      setEventos(data);
    } catch (error) { console.error('Error:', error); }
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

  const colorPunto = (p) => {
    if (p === 'ALTA') return 'bg-red-500';
    if (p === 'MEDIA') return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const borderPrioridad = (p) => {
    if (p === 'ALTA') return 'border-l-red-500';
    if (p === 'MEDIA') return 'border-l-yellow-400';
    return 'border-l-green-500';
  };

  const badgePrioridad = (p) => {
    if (p === 'ALTA') return 'bg-red-100 text-red-700';
    if (p === 'MEDIA') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
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

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300 mb-3";
  const labelCls = "block text-xs text-gray-500 mb-1";

  const FormModal = ({ titulo, formValues, onChange, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <p className="text-base font-medium text-gray-900">{titulo}</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <form onSubmit={onSubmit}>
          <label className={labelCls}>Título</label>
          <input name="titulo" value={formValues.titulo} onChange={onChange}
            placeholder="Ej: Empacar pedido" required className={inputCls} />

          <label className={labelCls}>Descripción</label>
          <textarea name="descripcion" value={formValues.descripcion} onChange={onChange}
            placeholder="Detalle opcional" rows="3"
            className={inputCls + " resize-y"} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha</label>
              <input name="fecha" type="date" value={formValues.fecha} onChange={onChange}
                required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hora</label>
              <input name="hora" type="time" value={formValues.hora} onChange={onChange}
                className={inputCls} />
            </div>
          </div>

          <label className={labelCls}>Prioridad</label>
          <select name="prioridad" value={formValues.prioridad} onChange={onChange} className={inputCls}>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>

          <div className="flex gap-3 justify-end mt-2">
            <button type="button" onClick={onClose}
              className="border border-gray-200 text-gray-500 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900 mb-1">Calendario</h1>
          <p className="text-sm text-gray-400">Gestiona tus eventos y pendientes</p>
        </div>
        <button onClick={() => setMostrarForm(true)}
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          + Nuevo evento
        </button>
      </div>

      {/* Grid — apilado en móvil, lado a lado en desktop */}
      <div className="flex flex-col md:grid md:grid-cols-[1fr_300px] gap-4">

        {/* Calendario */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
          {/* Navegación mes */}
          <div className="flex justify-between items-center mb-5">
            <button onClick={mesAnterior}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors text-lg">
              ‹
            </button>
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-gray-800">{meses[mesActual]} {anioActual}</span>
              <button onClick={irAHoy}
                className="border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                Hoy
              </button>
            </div>
            <button onClick={mesSiguiente}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors text-lg">
              ›
            </button>
          </div>

          {/* Días semana */}
          <div className="grid grid-cols-7 mb-1">
            {diasSemana.map(d => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium py-1.5 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Celdas */}
          <div className="grid grid-cols-7 gap-0.5">
            {celdas.map((dia, idx) => {
              if (!dia) return <div key={`e-${idx}`} />;
              const evDia = eventosDelDia(dia);
              const seleccionado = dia === diaSeleccionado;
              const hoyDia = esHoy(dia);
              const fechaCelda = formatFechaISO(anioActual, mesActual, dia);
              const esFestivo = !!festivos[fechaCelda];
              return (
                <div key={dia} onClick={() => setDiaSeleccionado(dia)}
                  className={`min-h-14 p-1.5 rounded-lg cursor-pointer transition-colors
                    ${seleccionado ? 'bg-gray-900' : hoyDia ? 'bg-gray-100' : esFestivo ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                  <div className={`text-xs text-center mb-1 font-${hoyDia ? '600' : '400'}
                    ${seleccionado ? 'text-white' : esFestivo ? 'text-purple-400' : 'text-gray-700'}`}>
                    {dia}
                  </div>
                  {esFestivo && !seleccionado && (
                    <div className="text-center text-purple-300 leading-tight mb-0.5" style={{ fontSize: '8px' }}>
                      {festivos[fechaCelda].split(' ').slice(0, 2).join(' ')}
                    </div>
                  )}
                  <div className="flex justify-center flex-wrap gap-0.5">
                    {evDia.slice(0, 3).map(ev => (
                      <div key={ev.id}
                        className={`w-1.5 h-1.5 rounded-full ${seleccionado ? 'bg-white' : colorPunto(ev.prioridad)}`} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel eventos del día */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
          <p className="text-sm font-medium text-gray-800 mb-1">Eventos del día</p>
          <p className="text-xs text-gray-400 capitalize mb-3">{fechaDiaSeleccionado}</p>

          {festivos[formatFechaISO(anioActual, mesActual, diaSeleccionado)] && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
              <span className="text-sm">🎉</span>
              <span className="text-xs text-purple-600 font-medium">
                {festivos[formatFechaISO(anioActual, mesActual, diaSeleccionado)]}
              </span>
            </div>
          )}

          {eventosDia.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-300">Sin eventos este día</div>
          ) : (
            <div className="flex flex-col gap-2" ref={menuRef}>
              {eventosDia.map(ev => (
                <div key={ev.id}
                  className={`border border-gray-100 border-l-4 ${borderPrioridad(ev.prioridad)} rounded-lg p-3 relative
                    ${ev.completado ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className={`text-sm font-medium text-gray-800 mb-1 ${ev.completado ? 'line-through' : ''}`}>
                        {ev.titulo}
                      </p>
                      {ev.descripcion && (
                        <p className="text-xs text-gray-400 mb-1.5">{ev.descripcion}</p>
                      )}
                      <div className="flex items-center gap-2">
                        {ev.hora && <span className="text-xs text-gray-300">⏰ {ev.hora}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded ${badgePrioridad(ev.prioridad)}`}>
                          {ev.prioridad}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {!ev.completado && !ev.cancelado && (
                        <>
                          <button onClick={() => completar(ev.id)}
                            className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-lg hover:bg-green-100 transition-colors">
                            ✓
                          </button>
                          <button onClick={() => cancelar(ev.id)}
                            className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-lg hover:bg-red-100 transition-colors">
                            ✕
                          </button>
                        </>
                      )}
                      {!ev.completado && (
                        <div className="relative">
                          <button
                            onClick={() => setMenuAbierto(menuAbierto === ev.id ? null : ev.id)}
                            className="text-gray-300 hover:text-gray-500 px-1.5 py-1 rounded text-base">
                            ⋮
                          </button>
                          {menuAbierto === ev.id && (
                            <div className="absolute right-0 top-full z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-32 overflow-hidden">
                              <div onClick={() => abrirEdicion(ev)}
                                className="px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                                ✏️ Editar evento
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal nuevo evento */}
      {mostrarForm && (
        <FormModal
          titulo="Nuevo evento"
          formValues={formData}
          onChange={handleChange}
          onSubmit={guardarEvento}
          onClose={() => setMostrarForm(false)}
        />
      )}

      {/* Modal editar evento */}
      {eventoEditando && (
        <FormModal
          titulo="Editar evento"
          formValues={formEdit}
          onChange={handleEditChange}
          onSubmit={guardarEdicion}
          onClose={() => setEventoEditando(null)}
        />
      )}
    </div>
  );
}

export default Calendario;