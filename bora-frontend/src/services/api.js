const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const getAuthHeaders = () => {
  const auth = localStorage.getItem('auth');

  return {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  };
};

export const clientesAPI = {

  getAll: async () => {
    const response = await fetch(`${API_URL}/clientes`, {
      headers: getAuthHeaders()
    });

    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      headers: getAuthHeaders()
    });

    return response.json();
  },

  create: async (cliente) => {
    const response = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cliente),
    });

    return response.json();
  },

  update: async (id, cliente) => {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(cliente),
    });

    return response.json();
  },

  delete: async (id) => {
    await fetch(`${API_URL}/clientes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  count: async () => {
    const response = await fetch(`${API_URL}/clientes/count`, {
      headers: getAuthHeaders()
    });

    return response.json();
  }
};

export const ventasAPI = {

  getAll: async () => {
    const response = await fetch(`${API_URL}/ventas`, {
      headers: getAuthHeaders()
    });

    return response.json();
  },

  ingresosTotal: async () => {
    const response = await fetch(`${API_URL}/ventas/ingresos-total`, {
      headers: getAuthHeaders()
    });

    return response.json();
  },

  gananciaTotal: async () => {
    const response = await fetch(`${API_URL}/ventas/ganancia-total`, {
      headers: getAuthHeaders()
    });

    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/ventas/${id}`, {
      headers: getAuthHeaders()
    });

    return response.json();
  },

  create: async (venta) => {
    const response = await fetch(`${API_URL}/ventas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(venta),
    });

    return response.json();
  },

  delete: async (id) => {
    await fetch(`${API_URL}/ventas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  ventasPorMes: async () => {
  const response = await fetch(`${API_URL}/ventas/ventas-por-mes`, {
    headers: getAuthHeaders()
  });

  return response.json();
}
};



export const eventosAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/eventos`);
    return response.json();
  },
  hoy: async () => {
    const response = await fetch(`${API_URL}/eventos/hoy`);
    return response.json();
  },
  create: async (evento) => {
    const response = await fetch(`${API_URL}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evento),
    });
    if (!response.ok) {
      const texto = await response.text();
      throw new Error(`Error ${response.status}: ${texto}`);
    }
    const texto = await response.text();
    return texto ? JSON.parse(texto) : {};
  },
  completar: async (id) => {
    const response = await fetch(`${API_URL}/eventos/completar/${id}`, { method: 'PUT' });
    return response.json();
  },
  cancelar: async (id) => {
    const response = await fetch(`${API_URL}/eventos/cancelar/${id}`, { method: 'PUT' });
    return response.json();
  },

  update: async (id, evento) => {
  const response = await fetch(`${API_URL}/eventos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evento),
  });
  return response.json();
},
};  