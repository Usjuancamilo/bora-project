package com.bora.borabackend.controller;

import com.bora.borabackend.entity.Venta;
import com.bora.borabackend.services.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    // GET /api/ventas - Listar todas
    @GetMapping
    public List<Venta> listarVentas() {
        return ventaService.findAll();
    }

    // GET /api/ventas/{id} - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<Venta> obtenerVenta(@PathVariable Long id) {
        return ventaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/ventas - Crear nueva
    @PostMapping
    public Venta crearVenta(@RequestBody Venta venta) {
        return ventaService.save(venta);
    }

    // PUT /api/ventas/{id} - Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<Venta> actualizarVenta(@PathVariable Long id, @RequestBody Venta ventaActualizada) {
        return ventaService.findById(id)
                .map(venta -> {
                    venta.setDescripcion(ventaActualizada.getDescripcion());
                    venta.setCostoProducto(ventaActualizada.getCostoProducto());
                    venta.setEmpaqueInsumos(ventaActualizada.getEmpaqueInsumos());
                    venta.setPrecioVenta(ventaActualizada.getPrecioVenta());
                    venta.setFecha(ventaActualizada.getFecha());
                    venta.setCliente(ventaActualizada.getCliente());
                    return ResponseEntity.ok(ventaService.save(venta));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/ventas/{id} - Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVenta(@PathVariable Long id) {
        if (ventaService.findById(id).isPresent()) {
            ventaService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // GET /api/ventas/count - Contar total
    @GetMapping("/count")
    public long contarVentas() {
        return ventaService.count();
    }

    // GET /api/ventas/ganancia-total - Calcular ganancia total
    @GetMapping("/ganancia-total")
    public BigDecimal obtenerGananciaTotal() {
        return ventaService.calcularGananciaTotal();
    }

    // GET /api/ventas/ingresos-total - Calcular ingresos totales
    @GetMapping("/ingresos-total")
    public BigDecimal obtenerIngresosTotal() {
        return ventaService.obtenerIngresosTotales();
    }


    //Esty creando grafica de ventas por mes en dashboard fron
    @GetMapping("/ventas-por-mes")
    public List<Object[]> ventasPorMes() {
        return ventaService.obtenerVentasPorMes();
    }
}