package com.bora.borabackend.controller;

import com.bora.borabackend.entity.Cliente;
import com.bora.borabackend.services.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;


import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // GET /api/clientes - Listar todos
    @GetMapping
    public List<Cliente> listarClientes() {
        return clienteService.findAll();
    }

    // GET /api/clientes/{id} - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> obtenerCliente(@PathVariable Long id) {
        return clienteService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/clientes - Crear nuevo
    @PostMapping
    public Cliente crearCliente(@RequestBody Cliente cliente) {
        return clienteService.save(cliente);
    }


    // PUT /api/clientes/{id} - Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizarCliente(@PathVariable Long id, @RequestBody Cliente clienteActualizado) {
        return clienteService.findById(id)
                .map(cliente -> {
                    cliente.setNombre(clienteActualizado.getNombre());
                    cliente.setTelefono(clienteActualizado.getTelefono());
                    cliente.setCiudad(clienteActualizado.getCiudad());
                    cliente.setInstagram(clienteActualizado.getInstagram());
                    cliente.setNotas(clienteActualizado.getNotas());
                    return ResponseEntity.ok(clienteService.save(cliente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/clientes/{id} - Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCliente(@PathVariable Long id) {
        if (clienteService.findById(id).isPresent()) {
            clienteService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // GET /api/clientes/count - Contar total
    @GetMapping("/count")
    public long contarClientes() {
        return clienteService.count();
    }
}