package com.bora.borabackend.repository;


import com.bora.borabackend.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    @Query("SELECT COALESCE(SUM(v.precioVenta), 0) FROM Venta v")
    BigDecimal obtenerIngresosTotales();

    @Query("SELECT COALESCE(SUM(v.precioVenta - v.costoProducto - v.empaqueInsumos), 0) FROM Venta v")
    BigDecimal obtenerGananciaTotal();


    @Query("""
SELECT EXTRACT(MONTH FROM v.fecha), SUM(v.precioVenta)
FROM Venta v
GROUP BY EXTRACT(MONTH FROM v.fecha)
ORDER BY EXTRACT(MONTH FROM v.fecha)
""")
    List<Object[]> ventasPorMes();
}