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
            PasswordEncoder passwordEncoder
    ) {
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
        if (!usuarioRepository.existsByCorreo("admin@codffee.com")) {
            Usuario admin = new Usuario();
            admin.setNombre("Administrador Codffee");
            admin.setCorreo("admin@codffee.com");
            admin.setContrasena(passwordEncoder.encode("123456"));
            admin.setRol(Rol.ADMIN);
            admin.setActivo(true);
            admin.setFechaRegistro(LocalDateTime.now());
            usuarioRepository.save(admin);
        }

        if (!usuarioRepository.existsByCorreo("personal@codffee.com")) {
            Usuario personal = new Usuario();
            personal.setNombre("Personal Cafetería");
            personal.setCorreo("personal@codffee.com");
            personal.setContrasena(passwordEncoder.encode("123456"));
            personal.setRol(Rol.PERSONAL);
            personal.setActivo(true);
            personal.setFechaRegistro(LocalDateTime.now());
            usuarioRepository.save(personal);
        }

        if (!usuarioRepository.existsByCorreo("cliente@codffee.com")) {
            Usuario cliente = new Usuario();
            cliente.setNombre("Cliente Prueba");
            cliente.setCorreo("cliente@codffee.com");
            cliente.setContrasena(passwordEncoder.encode("123456"));
            cliente.setRol(Rol.CLIENTE);
            cliente.setActivo(true);
            cliente.setFechaRegistro(LocalDateTime.now());
            usuarioRepository.save(cliente);
        }

        if (!usuarioRepository.existsByCorreo("wilfridoadmin@gmail.com")) {
            Usuario wilfridoAdmin = new Usuario();
            wilfridoAdmin.setNombre("Wilfrido Admin");
            wilfridoAdmin.setCorreo("wilfridoadmin@gmail.com");
            wilfridoAdmin.setContrasena(passwordEncoder.encode("Wilfrido23"));
            wilfridoAdmin.setRol(Rol.ADMIN);
            wilfridoAdmin.setActivo(true);
            wilfridoAdmin.setFechaRegistro(LocalDateTime.now());
            usuarioRepository.save(wilfridoAdmin);
        }
    }

    private void crearCategoriasYProductosIniciales() {
        Categoria bebidas = crearCategoriaSiNoExiste(
                "Bebidas",
                "Cafés, tés, jugos y otras bebidas"
        );

        Categoria desayunos = crearCategoriaSiNoExiste(
                "Desayunos",
                "Alimentos para iniciar el día"
        );

        Categoria postres = crearCategoriaSiNoExiste(
                "Postres",
                "Pan dulce, galletas y productos dulces"
        );

        Categoria snacks = crearCategoriaSiNoExiste(
                "Snacks",
                "Productos rápidos para consumir entre clases"
        );

        crearProductoSiNoExiste(
                "Café americano",
                "Café caliente de grano",
                new BigDecimal("25.00"),
                30,
                "https://example.com/cafe-americano.jpg",
                bebidas
        );

        crearProductoSiNoExiste(
                "Capuchino",
                "Café con leche espumada",
                new BigDecimal("38.00"),
                20,
                "https://example.com/capuchino.jpg",
                bebidas
        );

        crearProductoSiNoExiste(
                "Sándwich de jamón",
                "Sándwich preparado con jamón, queso y vegetales",
                new BigDecimal("45.00"),
                15,
                "https://example.com/sandwich.jpg",
                desayunos
        );

        crearProductoSiNoExiste(
                "Mollete",
                "Pan con frijoles, queso y pico de gallo",
                new BigDecimal("35.00"),
                18,
                "https://example.com/mollete.jpg",
                desayunos
        );

        crearProductoSiNoExiste(
                "Dona de chocolate",
                "Dona cubierta con chocolate",
                new BigDecimal("22.00"),
                25,
                "https://example.com/dona.jpg",
                postres
        );

        crearProductoSiNoExiste(
                "Papas fritas",
                "Bolsa individual de papas",
                new BigDecimal("18.00"),
                40,
                "https://example.com/papas.jpg",
                snacks
        );
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
            Categoria categoria
    ) {
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