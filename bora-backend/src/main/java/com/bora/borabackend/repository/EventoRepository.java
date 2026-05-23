package com.bora.borabackend.repository;

import com.bora.borabackend.entity.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {

    // Eventos de un día específico
    List<Evento> findByFecha(LocalDate fecha);

    // Eventos pendientes del día
    List<Evento> findByFechaAndCompletadoFalseAndCanceladoFalse(LocalDate fecha);

}