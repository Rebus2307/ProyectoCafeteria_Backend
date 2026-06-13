package com.codffee.backend.service;

import com.codffee.backend.dto.DetallePedidoRequest;
import com.codffee.backend.dto.PedidoRequest;
import com.codffee.backend.entity.*;
import com.codffee.backend.exception.RecursoNoEncontradoException;
import com.codffee.backend.exception.SolicitudInvalidaException;
import com.codffee.backend.repository.DetallePedidoRepository;
import com.codffee.backend.repository.PedidoRepository;
import com.codffee.backend.repository.ProductoRepository;
import com.codffee.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final CorreoService correoService;

    public PedidoService(
            PedidoRepository pedidoRepository,
            DetallePedidoRepository detallePedidoRepository,
            UsuarioRepository usuarioRepository,
            ProductoRepository productoRepository,
            CorreoService correoService
    ) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.correoService = correoService;
    }

    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado con ID: " + id));
    }

    public List<Pedido> listarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId);
    }

    public List<Pedido> listarPorEstado(EstadoPedido estado) {
        return pedidoRepository.findByEstado(estado);
    }

    public List<DetallePedido> listarDetallesPorPedido(Long pedidoId) {
        return detallePedidoRepository.findByPedidoId(pedidoId);
    }

    @Transactional
    public Pedido crearPedido(PedidoRequest pedidoRequest) {
        Usuario usuario = usuarioRepository.findById(pedidoRequest.getUsuarioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con ID: " + pedidoRequest.getUsuarioId()));

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setFechaHora(LocalDateTime.now());
        pedido.setEstado(EstadoPedido.PENDIENTE);
        pedido.setMetodoPago(pedidoRequest.getMetodoPago());
        pedido.setObservaciones(pedidoRequest.getObservaciones());
        pedido.setTotal(BigDecimal.ZERO);

        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        BigDecimal total = BigDecimal.ZERO;
        StringBuilder resumenProductos = new StringBuilder();

        for (DetallePedidoRequest item : pedidoRequest.getProductos()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + item.getProductoId()));

            if (!producto.getDisponible()) {
                throw new SolicitudInvalidaException("El producto no está disponible: " + producto.getNombre());
            }

            if (producto.getStock() < item.getCantidad()) {
                throw new SolicitudInvalidaException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            BigDecimal precioUnitario = producto.getPrecio();
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()));

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedidoGuardado);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(subtotal);

            detallePedidoRepository.save(detalle);

            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);

            total = total.add(subtotal);

            resumenProductos.append("- ")
                    .append(producto.getNombre())
                    .append(" | Cantidad: ")
                    .append(item.getCantidad())
                    .append(" | Precio unitario: $")
                    .append(precioUnitario)
                    .append(" | Subtotal: $")
                    .append(subtotal)
                    .append("\n");
        }

        pedidoGuardado.setTotal(total);
        Pedido pedidoFinal = pedidoRepository.save(pedidoGuardado);

        try {
            enviarCorreoConfirmacionPedido(usuario, pedidoFinal, resumenProductos.toString());
        } catch (Exception e) {
            System.out.println("El pedido se creó, pero no se pudo enviar el correo: " + e.getMessage());
        }

        return pedidoFinal;
    }

    private void enviarCorreoConfirmacionPedido(Usuario usuario, Pedido pedido, String resumenProductos) {
        String asunto = "Confirmación de pedido - Codffee";

        String mensaje = """
                Hola %s,

                Tu pedido fue registrado correctamente en Codffee.

                Número de pedido: %d
                Estado: %s
                Método de pago: %s
                Total: $%s

                Productos:
                %s

                Observaciones:
                %s

                Te notificaremos cuando tu pedido esté listo para recoger.

                Gracias por usar Codffee.
                """.formatted(
                usuario.getNombre(),
                pedido.getId(),
                pedido.getEstado(),
                pedido.getMetodoPago(),
                pedido.getTotal(),
                resumenProductos,
                pedido.getObservaciones() != null && !pedido.getObservaciones().isBlank()
                        ? pedido.getObservaciones()
                        : "Sin observaciones"
        );

        correoService.enviarCorreoSimple(usuario.getCorreo(), asunto, mensaje);
    }

    @Transactional
    public Pedido cambiarEstado(Long pedidoId, EstadoPedido nuevoEstado) {
        Pedido pedido = buscarPorId(pedidoId);

        EstadoPedido estadoAnterior = pedido.getEstado();

        if (estadoAnterior == EstadoPedido.CANCELADO) {
            throw new SolicitudInvalidaException("No se puede cambiar el estado de un pedido cancelado");
        }

        pedido.setEstado(nuevoEstado);

        Pedido pedidoActualizado = pedidoRepository.save(pedido);

        enviarCorreoCambioEstado(pedidoActualizado, estadoAnterior, nuevoEstado);

        return pedidoActualizado;
    }

    @Transactional
    public void cancelarPedido(Long pedidoId) {
        Pedido pedido = buscarPorId(pedidoId);

        if (pedido.getEstado() == EstadoPedido.ENTREGADO) {
            throw new SolicitudInvalidaException("No se puede cancelar un pedido que ya fue entregado");
        }

        if (pedido.getEstado() == EstadoPedido.CANCELADO) {
            throw new SolicitudInvalidaException("El pedido ya está cancelado");
        }

        EstadoPedido estadoAnterior = pedido.getEstado();

        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoId(pedidoId);

        for (DetallePedido detalle : detalles) {
            Producto producto = detalle.getProducto();
            producto.setStock(producto.getStock() + detalle.getCantidad());
            productoRepository.save(producto);
        }

        pedido.setEstado(EstadoPedido.CANCELADO);
        Pedido pedidoCancelado = pedidoRepository.save(pedido);

        enviarCorreoCambioEstado(pedidoCancelado, estadoAnterior, EstadoPedido.CANCELADO);
    }

    private void enviarCorreoCambioEstado(Pedido pedido, EstadoPedido estadoAnterior, EstadoPedido nuevoEstado) {
        Usuario usuario = pedido.getUsuario();

        String asunto = "Actualización de estado de tu pedido - Codffee";

        String mensajeEstado = switch (nuevoEstado) {
            case PENDIENTE -> "Tu pedido se encuentra pendiente de preparación.";
            case EN_PREPARACION -> "Tu pedido ya está en preparación.";
            case LISTO -> "Tu pedido ya está listo para recoger.";
            case ENTREGADO -> "Tu pedido fue marcado como entregado. ¡Gracias por usar Codffee!";
            case CANCELADO -> "Tu pedido fue cancelado.";
        };

        String mensaje = """
            Hola %s,

            El estado de tu pedido #%d ha sido actualizado.

            Estado anterior: %s
            Nuevo estado: %s

            %s

            Total del pedido: $%s

            Gracias por usar Codffee.
            """.formatted(
                usuario.getNombre(),
                pedido.getId(),
                estadoAnterior,
                nuevoEstado,
                mensajeEstado,
                pedido.getTotal()
        );

        try {
            correoService.enviarCorreoSimple(usuario.getCorreo(), asunto, mensaje);
        } catch (Exception e) {
            System.out.println("El estado del pedido se actualizó, pero no se pudo enviar el correo: " + e.getMessage());
        }
    }
}