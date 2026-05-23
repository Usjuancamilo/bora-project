package com.bora.borabackend.services;

import com.bora.borabackend.entity.Evento;
import com.bora.borabackend.repository.EventoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class EventoService {

    @Autowired
    private EventoRepository eventoRepository;

    // Obtener todos
    public List<Evento> findAll() {
        return eventoRepository.findAll();
    }

    // Obtener por ID
    public Optional<Evento> findById(Long id) {
        return eventoRepository.findById(id);
    }

    // Guardar evento
    public Evento save(Evento evento) {
        return eventoRepository.save(evento);
    }

    // Eliminar
    public void deleteById(Long id) {
        eventoRepository.deleteById(id);
    }

    // Contar eventos
    public long count() {
        return eventoRepository.count();
    }

    // Eventos por fecha
    public List<Evento> findByFecha(LocalDate fecha) {
        return eventoRepository.findByFecha(fecha);
    }

    // Pendientes de hoy
    public List<Evento> obtenerPendientesHoy() {
        return eventoRepository
                .findByFechaAndCompletadoFalseAndCanceladoFalse(LocalDate.now());
    }

    // Marcar como completado
    public Evento completarEvento(Long id) {

        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        evento.setCompletado(true);

        return eventoRepository.save(evento);
    }

    // Cancelar evento
    public Evento cancelarEvento(Long id) {

        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        evento.setCancelado(true);

        return eventoRepository.save(evento);
    }

    // Actualizar evento
    public Evento update(Long id, Evento eventoActualizado) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        evento.setTitulo(eventoActualizado.getTitulo());
        evento.setDescripcion(eventoActualizado.getDescripcion());
        evento.setFecha(eventoActualizado.getFecha());
        evento.setHora(eventoActualizado.getHora());
        evento.setPrioridad(eventoActualizado.getPrioridad());

        return eventoRepository.save(evento);
    }
}