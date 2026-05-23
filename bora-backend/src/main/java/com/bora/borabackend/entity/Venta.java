package com.bora.borabackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ventas")

public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(unique = true, nullable = false, length = 10)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String descripcion;

    @Column(name = "costo_producto", nullable = false, precision = 12, scale = 2)
    private BigDecimal costoProducto;

    @Column(name = "empaque_insumos", precision = 12, scale = 2)
    private BigDecimal empaqueInsumos = BigDecimal.ZERO;

    @Column(name = "precio_venta", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioVenta;

    @Column(nullable = false)
    private LocalDate fecha;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Método para calcular la ganancia
    public BigDecimal getGanancia() {
        return precioVenta.subtract(costoProducto).subtract(empaqueInsumos);
    }

    // Método para calcular el margen
    public BigDecimal getMargen() {
        if (precioVenta.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return getGanancia().divide(precioVenta, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(new BigDecimal(100));
    }
}