# ☕ Codffee - Sistema de Pedidos para Cafetería

**Codffee** es una aplicación web full-stack para gestionar pedidos de una cafetería universitaria. Los clientes pueden ver el menú, armar un carrito y hacer pedidos; el personal de cafetería puede gestionar el estado de los pedidos; y los administradores tienen acceso a reportes, gestión de usuarios y dashboards.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19, Vite 8, React Router 7, Bootstrap 5, Axios |
| **Backend** | Java 25, Spring Boot 4.0.6, Spring Security, JPA/Hibernate |
| **Base de datos** | MySQL 8.0 |
| **Autenticación** | JWT (JSON Web Tokens) |
| **Documentación API** | Swagger UI / OpenAPI 3.0 |
| **Contenedores** | Docker + Docker Compose |

---

## 📁 Estructura del proyecto

```
codffee-backend/          # Backend Spring Boot
├── Dockerfile
├── docker-compose.yml
├── pom.xml
└── src/main/java/com/codffee/backend/
    ├── config/           # CORS, DataInitializer, OpenAPI
    ├── controller/       # REST controllers
    ├── dto/              # Request/Response DTOs
    ├── entity/           # JPA entities
    ├── exception/        # Error handling
    ├── repository/       # Data access
    ├── security/         # JWT + Security config
    └── service/          # Business logic

codffee-frontend/         # Frontend React
├── .env
├── package.json
├── vite.config.js
└── src/
    ├── components/       # Reusable components
    ├── pages/            # Route pages
    ├── routes/           # Protected routes, role guards
    └── services/         # API clients (Axios)
```

---

## 🚀 Requisitos

- **Docker** + Docker Compose (para el backend)
- **Node.js 18+** y **npm** (para el frontend, opcional si solo usas Swagger)

---

## ⚙️ Configuración

### 1. Backend (.env)

Crea `codffee-backend/.env`:

```env
MYSQL_DATABASE=codffee_db
MYSQL_ROOT_PASSWORD=root

SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root

SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=TU_CORREO@gmail.com
SPRING_MAIL_PASSWORD=TU_PASSWORD_DE_APLICACION

JWT_SECRET=Q29kZmZlZVNlY3JldEtleTIwMjZQcm95ZWN0b0NhZmV0ZXJpYVNlZ3VyYQ==
JWT_EXPIRATION_MS=86400000
```

> Para el correo, usa una **contraseña de aplicación de Gmail**, no tu contraseña normal.

### 2. Frontend (.env)

Crea `codffee-frontend/.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

---

## 🐳 Ejecutar con Docker (Backend)

```bash
cd codffee-backend
docker compose up --build
```

Esto levanta:
- **codffee-mysql** (MySQL 8.0 en puerto 3307)
- **codffee-backend** (Spring Boot en puerto 8080)

Verifica con:

```bash
docker ps
```

---

## 💻 Ejecutar Frontend

```bash
cd codffee-frontend
npm install
npm run dev
```

Abrir en `http://localhost:5173`

---

## 🔑 Cuentas de prueba

El sistema crea estos usuarios automáticamente al iniciar:

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| **ADMIN** | admin@codffee.com | 123456 |
| **ADMIN** | wilfridoadmin@gmail.com | Wilfrido23 |
| **PERSONAL** | personal@codffee.com | 123456 |
| **CLIENTE** | cliente@codffee.com | 123456 |

---

## 🧭 Funcionalidades por Rol

### Cliente
- Ver menú con categorías y buscar productos (búsqueda sin acentos ✅)
- Seleccionar cantidad de productos con el selector +/- ✅
- Agregar productos al carrito (el contador de stock se actualiza en tiempo real)
- Ver y modificar carrito (cantidad, eliminar productos, observaciones)
- Elegir método de pago (Efectivo / Tarjeta / Transferencia)
- Confirmar pedido (descuenta stock, envía correo de confirmación)
- Ver historial de pedidos con estado y total
- **Perfil**: editar nombre, cambiar contraseña, subir foto de perfil (se muestra en el navbar)

### Personal / Staff
- Ver todos los pedidos entrantes con buscador
- Cambiar estado de pedidos: PENDIENTE → EN_PREPARACION → LISTO → ENTREGADO
- Cancelar pedidos (restaura el stock)

### Administrador
- Dashboard con estadísticas (pedidos totales, activos, ingresos)
- Gestión de usuarios: crear, cambiar rol (CLIENTE / PERSONAL / ADMIN), activar/desactivar
- Reportes PDF: general y filtrado por fecha/estado
- Todo lo que puede hacer el personal

---

## 📡 API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar nuevo cliente |

### Perfil
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/perfil` | Obtener perfil del usuario autenticado |
| PUT | `/api/perfil` | Actualizar nombre y/o contraseña |

### Productos
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/productos/disponibles` | Público |
| GET/POST/PUT/DELETE | `/api/productos/**` | ADMIN / PERSONAL |

### Categorías
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/categorias/activas` | Público |
| GET/POST/PUT/DELETE | `/api/categorias/**` | ADMIN / PERSONAL |

### Pedidos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/pedidos` | Listar todos |
| GET | `/api/pedidos/{id}` | Buscar por ID |
| GET | `/api/pedidos/usuario/{id}` | Pedidos de un usuario |
| POST | `/api/pedidos` | Crear pedido |
| PUT | `/api/pedidos/{id}/estado/{estado}` | Cambiar estado |
| PUT | `/api/pedidos/{id}/cancelar` | Cancelar pedido |

### Usuarios (solo ADMIN)
| Método | Ruta |
|--------|------|
| GET/POST | `/api/usuarios` |
| GET/PUT/DELETE | `/api/usuarios/{id}` |

### Reportes (solo ADMIN)
| Método | Ruta |
|--------|------|
| GET | `/api/reportes/pedidos/pdf` |
| GET | `/api/reportes/pedidos/pdf/filtrado` |

---

## 📖 Swagger UI

Con el backend corriendo, abre:

```
http://localhost:8080/swagger-ui/index.html
```

1. Haz login en `POST /api/auth/login`
2. Copia el token JWT
3. Presiona **Authorize** y pega `Bearer TU_TOKEN`
4. Prueba los endpoints protegidos

---

## 🧪 Probar el flujo completo

### Desde el Frontend (recomendado)

1. Abre `http://localhost:5173`
2. Regístrate como cliente o usa `cliente@codffee.com / 123456`
3. Navega por el menú, selecciona cantidad y agrega productos al carrito
4. Ve al carrito y confirma el pedido
5. Inicia sesión como `personal@codffee.com / 123456` en otra pestaña
6. Ve a Pedidos, cambia el estado a EN_PREPARACION → LISTO
7. Inicia sesión como `admin@codffee.com / 123456`
8. Ve al Dashboard, Usuarios, Reportes

### Desde Swagger

1. Login como cliente → `POST /api/auth/login`
2. Autorizar Swagger con el token
3. `GET /api/productos/disponibles`
4. `POST /api/pedidos` (usar `usuarioId` del paso 1)
5. Login como personal → cambiar estado del pedido
6. Login como admin → `/api/usuarios`, `/api/reportes/pedidos/pdf`

---

## 🛠️ Comandos útiles

```bash
# Reconstruir backend
docker compose up --build -d

# Ver logs
docker logs -f codffee-backend

# Detener todo
docker compose down

# Detener y borrar BD
docker compose down -v

# Reconstruir desde cero
docker compose down -v && docker compose up --build
```

---

## ❗ Problemas comunes

### CORS: No se pueden hacer peticiones desde el frontend
Asegúrate de reconstruir el backend después de cualquier cambio:
```bash
docker compose down && docker compose up --build -d
```

### Error "No se pudo crear el pedido"
1. Verifica que el backend esté corriendo (`docker ps`)
2. Revisa la consola del navegador (F12) para errores CORS
3. Confirma que el producto tenga stock disponible

### No llegan correos de notificación
Revisa las credenciales SMTP en `.env`. Gmail requiere una **contraseña de aplicación**.

### Error "release 25 is not found" en VS Code
Es solo un aviso del IDE local. No afecta el build en Docker. Instala Java 25 en tu máquina si quieres eliminarlo (https://adoptium.net/tem/releases/?version=25).

---

## 📄 Licencia

Proyecto académico.
