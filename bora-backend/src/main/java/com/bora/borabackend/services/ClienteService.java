package com.bora.borabackend.services;

import com.bora.borabackend.entity.Cliente;
import com.bora.borabackend.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service

public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    //Listar todos los clientes
    public List<Cliente> findAll(){
        return clienteRepository.findAll();
    }

    //Buscar cliente por ID
    public Optional<Cliente> findById(Long id){
        return clienteRepository.findById(id);
    }

    // Guardar cliente (crear o actualizar)
    public Cliente save(Cliente cliente) {
        // Si es un cliente nuevo (sin ID), generar código automáticamente
        if (cliente.getId() == null) {
            long totalClientes = clienteRepository.count();
            String nuevoCodigo = "CLI-" + String.format("%03d", totalClientes + 1);
            cliente.setCodigo(nuevoCodigo);
        }
        return clienteRepository.save(cliente);
    }

    //Eliminar cliente por ID
    public void deleteById(Long id){
        clienteRepository.deleteById(id);
    }

    //Contar total de clientes
    public long count(){
        return clienteRepository.count();
    }

}
