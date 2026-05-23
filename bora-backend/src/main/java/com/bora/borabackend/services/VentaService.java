package com.bora.borabackend.services;

import com.bora.borabackend.entity.Venta;
import com.bora.borabackend.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service

public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    //Listar todas las ventas
    public List<Venta> findAll(){
        return ventaRepository.findAll();
    }

    //Buscar venta por ID
    public Optional<Venta> findById(Long id){
        return ventaRepository.findById(id);
    }


    //Guardar venta (crear o actualizar)
    public Venta save(Venta venta) {
        if (venta.getCodigo() == null || venta.getCodigo().isEmpty()) {
            long total = ventaRepository.count();
            String codigo = String.format("VTA-%03d", total + 1);
            venta.setCodigo(codigo);
        }
        return ventaRepository.save(venta);
    }

    //Eliminar venta por ID
    public void deleteById(Long id){
        ventaRepository.deleteById(id);
    }

    //Contar total de ventas
    public long count(){
        return ventaRepository.count();
    }


    //calcular ganancia total de todas las ventas
    public BigDecimal calcularGananciaTotal(){
        List<Venta> ventas = ventaRepository.findAll();
        return ventas.stream()
                .map(Venta::getGanancia)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }


  /*  //Calcular ingresos totales
    public BigDecimal calcularIngresosTotal(){
        List<Venta> ventas = ventaRepository.findAll();
        return ventas.stream()
                .map(Venta::getPrecioVenta)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    } */


    public BigDecimal obtenerIngresosTotales() {
        return ventaRepository.obtenerIngresosTotales();
    }

//para agregar grafica en dashboard fron
    public List<Object[]> obtenerVentasPorMes() {
        return ventaRepository.ventasPorMes();
    }

}
