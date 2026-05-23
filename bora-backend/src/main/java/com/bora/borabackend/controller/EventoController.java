package com.bora.borabackend.controller;

import com.bora.borabackend.entity.Evento;
import com.bora.borabackend.services.EventoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "*")
public class EventoController {

    @Autowired
    private EventoService eventoService;

    // GET - Listar todos los eventos
    @GetMapping
    public List<Evento> listarEventos() {
        return eventoService.findAll();
    }

    // GET - Obtener evento por ID
    @GetMapping("/{id}")
    public ResponseEntity<Evento> obtenerEvento(@PathVariable Long id) {

        return eventoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST - Crear evento
    @PostMapping
    public Evento crearEvento(@RequestBody Evento evento) {
        return eventoService.save(evento);
    }

    // DELETE - Eliminar evento
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEvento(@PathVariable Long id) {

        if (eventoService.findById(id).isPresent()) {

            eventoService.deleteById(id);

            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }

    // GET - Eventos de hoy pendientes
    @GetMapping("/hoy")
    public List<Evento> obtenerPendientesHoy() {
        return eventoService.obtenerPendientesHoy();
    }

    // GET - Eventos por fecha
    @GetMapping("/fecha/{fecha}")
    public List<Evento> obtenerEventosPorFecha(@PathVariable String fecha) {

        LocalDate fechaLocal = LocalDate.parse(fecha);

        return eventoService.findByFecha(fechaLocal);
    }

    // PUT - Completar evento
    @PutMapping("/completar/{id}")
    public Evento completarEvento(@PathVariable Long id) {

        return eventoService.completarEvento(id);
    }

    // PUT - Cancelar evento
    @PutMapping("/cancelar/{id}")
    public Evento cancelarEvento(@PathVariable Long id) {

        return eventoService.cancelarEvento(id);
    }

    // PUT - Actualizar evento
    @PutMapping("/{id}")
    public ResponseEntity<Evento> actualizarEvento(@PathVariable Long id, @RequestBody Evento eventoActualizado) {
        try {
            Evento actualizado = eventoService.update(id, eventoActualizado);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}