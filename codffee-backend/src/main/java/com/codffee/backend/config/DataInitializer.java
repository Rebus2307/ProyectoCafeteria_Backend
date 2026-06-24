package com.codffee.backend.config;

import com.codffee.backend.entity.Categoria;
import com.codffee.backend.entity.Producto;
import com.codffee.backend.entity.Rol;
import com.codffee.backend.entity.Usuario;
import com.codffee.backend.repository.CategoriaRepository;
import com.codffee.backend.repository.ProductoRepository;
import com.codffee.backend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            CategoriaRepository categoriaRepository,
            ProductoRepository productoRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        crearUsuariosIniciales();
        crearCategoriasYProductosIniciales();
    }

    private void crearUsuariosIniciales() {
        // Limpiar otros usuarios que no correspondan (con protección de claves foráneas)
        java.util.List<Usuario> todosLosUsuarios = usuarioRepository.findAll();
        for (Usuario u : todosLosUsuarios) {
            if (!u.getCorreo().equals("codffee.notificaciones.api@gmail.com") &&
                    !u.getCorreo().equals("willy2019031000merlin@gmail.com")) {
                try {
                    usuarioRepository.delete(u);
                } catch (Exception e) {
                    System.out.println("No se pudo eliminar el usuario [" + u.getCorreo() + "] debido a restricciones de clave foránea.");
                }
            }
        }

        // 1. Administrador: codffee.notificaciones.api@gmail.com / Admin123
        Usuario admin = usuarioRepository.findByCorreo("codffee.notificaciones.api@gmail.com").orElse(new Usuario());
        admin.setNombre("Administrador Codffee");
        admin.setCorreo("codffee.notificaciones.api@gmail.com");
        admin.setContrasena(passwordEncoder.encode("Admin123"));
        admin.setRol(Rol.ADMIN);
        admin.setActivo(true);
        if (admin.getId() == null) {
            admin.setFechaRegistro(LocalDateTime.now());
        }
        usuarioRepository.save(admin);

        // 2. Personal: willy2019031000merlin@gmail.com / Wilfrido23
        Usuario personal = usuarioRepository.findByCorreo("willy2019031000merlin@gmail.com").orElse(new Usuario());
        personal.setNombre("Personal Cafetería");
        personal.setCorreo("willy2019031000merlin@gmail.com");
        personal.setContrasena(passwordEncoder.encode("Wilfrido23"));
        personal.setRol(Rol.PERSONAL);
        personal.setActivo(true);
        if (personal.getId() == null) {
            personal.setFechaRegistro(LocalDateTime.now());
        }
        usuarioRepository.save(personal);

        // Debug: Imprimir usuarios actuales para verificar en Render
        System.out.println("=== DEBUG: USUARIOS EN BD INICIALIZADOS ===");
        usuarioRepository.findAll().forEach(u -> {
            System.out.println("-> Correo: [" + u.getCorreo() + "] | Rol: [" + u.getRol() + "] | Activo: [" + u.getActivo() + "]");
        });
        System.out.println("==========================================");
    }

    private void crearCategoriasYProductosIniciales() {
        Categoria bebidas = crearCategoriaSiNoExiste(
                "Bebidas",
                "Cafés, tés, jugos y otras bebidas");

        Categoria desayunos = crearCategoriaSiNoExiste(
                "Desayunos",
                "Alimentos para iniciar el día");

        Categoria postres = crearCategoriaSiNoExiste(
                "Postres",
                "Pan dulce, galletas y productos dulces");

        Categoria snacks = crearCategoriaSiNoExiste(
                "Snacks",
                "Productos rápidos para consumir entre clases");

        crearProductoSiNoExiste(
                "Café americano",
                "Café caliente de grano",
                new BigDecimal("25.00"),
                30,
                "https://example.com/cafe-americano.jpg",
                bebidas);

        crearProductoSiNoExiste(
                "Capuchino",
                "Café con leche espumada",
                new BigDecimal("38.00"),
                20,
                "https://example.com/capuchino.jpg",
                bebidas);

        crearProductoSiNoExiste(
                "Sándwich de jamón",
                "Sándwich preparado con jamón, queso y vegetales",
                new BigDecimal("45.00"),
                15,
                "https://example.com/sandwich.jpg",
                desayunos);

        crearProductoSiNoExiste(
                "Mollete",
                "Pan con frijoles, queso y pico de gallo",
                new BigDecimal("35.00"),
                18,
                "https://example.com/mollete.jpg",
                desayunos);

        crearProductoSiNoExiste(
                "Dona de chocolate",
                "Dona cubierta con chocolate",
                new BigDecimal("22.00"),
                25,
                "https://example.com/dona.jpg",
                postres);

        crearProductoSiNoExiste(
                "Papas fritas",
                "Bolsa individual de papas",
                new BigDecimal("18.00"),
                40,
                "https://example.com/papas.jpg",
                snacks);
    }

    private Categoria crearCategoriaSiNoExiste(String nombre, String descripcion) {
        return categoriaRepository.findByNombre(nombre)
                .orElseGet(() -> {
                    Categoria categoria = new Categoria();
                    categoria.setNombre(nombre);
                    categoria.setDescripcion(descripcion);
                    categoria.setActivo(true);
                    return categoriaRepository.save(categoria);
                });
    }

    private void crearProductoSiNoExiste(
            String nombre,
            String descripcion,
            BigDecimal precio,
            Integer stock,
            String imagenUrl,
            Categoria categoria) {
        if (!productoRepository.existsByNombre(nombre)) {
            Producto producto = new Producto();
            producto.setNombre(nombre);
            producto.setDescripcion(descripcion);
            producto.setPrecio(precio);
            producto.setStock(stock);
            producto.setImagenUrl(imagenUrl);
            producto.setDisponible(true);
            producto.setCategoria(categoria);

            productoRepository.save(producto);
        }
    }
}