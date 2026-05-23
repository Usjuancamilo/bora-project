package com.bora.borabackend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "eventos")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Título del evento o tarea
    @Column(nullable = false, length = 150)
    private String titulo;

    // Descripción opcional
    @Column(length = 500)
    private String descripcion;

    // Fecha del evento
    @Column(nullable = false)
    private LocalDate fecha;

    // Hora opcional
    private LocalTime hora;

    // Prioridad: ALTA, MEDIA, BAJA
    @Column(length = 20)
    private String prioridad = "MEDIA";

    // Estado completado
    private Boolean completado = false;

    // Estado cancelado
    private Boolean cancelado = false;

    // Fecha creación automática
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Relación opcional con cliente
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
}