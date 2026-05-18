# Codffee - Ejecución con Docker y pruebas con Swagger

Codffee es un backend desarrollado con Spring Boot para un sistema de pedidos de cafetería. Este README explica únicamente cómo ejecutar el proyecto con Docker y cómo probar sus principales funcionalidades desde Swagger UI.

---

## 1. Requisitos previos

Para ejecutar el proyecto solo necesitas tener instalado:

- Docker
- Docker Compose

Puedes verificar que Docker esté instalado ejecutando:

```bash
docker --version
```

Y también:

```bash
docker compose version
```

---

## 2. Estructura esperada del proyecto

En la raíz del proyecto backend deben existir estos archivos:

```text
codffee-backend/
├── src/
├── pom.xml
├── Dockerfile
├── docker-compose.yml
├── .env
├── .dockerignore
└── README.md
```

El archivo más importante para la configuración de Docker es:

```text
docker-compose.yml
```

Y el archivo donde se guardan variables como contraseñas y correo es:

```text
.env
```

---

## 3. Crear archivo `.env`

En la raíz del proyecto crea un archivo llamado:

```text
.env
```

Dentro del archivo coloca la siguiente configuración:

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

Debes cambiar estos valores:

```text
TU_CORREO@gmail.com
TU_PASSWORD_DE_APLICACION
```

Por el correo real que utilizarás para enviar notificaciones desde el sistema.

Importante: si usas Gmail, no debes usar la contraseña normal de tu cuenta. Debes usar una contraseña de aplicación.

---

## 4. Ejecutar el proyecto con Docker

Abre una terminal en la raíz del proyecto, donde se encuentra el archivo:

```text
docker-compose.yml
```

Ejecuta:

```bash
docker compose up --build
```

La primera vez puede tardar algunos minutos porque Docker debe descargar imágenes, construir el backend y levantar MySQL.

Cuando termine correctamente, deben quedar activos dos contenedores:

```text
codffee-backend
codffee-mysql
```

Puedes comprobarlo con:

```bash
docker ps
```

---

## 5. Abrir Swagger UI

Cuando el backend esté activo, abre en tu navegador:

```text
http://localhost:8080/swagger-ui/index.html
```

Desde Swagger podrás probar todos los endpoints del backend.

---

## 6. Datos iniciales del sistema

Al iniciar el backend, el sistema crea automáticamente usuarios, categorías y productos iniciales.

### Cuenta de administrador

```text
Correo: admin@codffee.com
Contraseña: 123456
Rol: ADMIN
```

### Cuenta de personal de cafetería

```text
Correo: personal@codffee.com
Contraseña: 123456
Rol: PERSONAL
```

### Cuenta de cliente

```text
Correo: cliente@codffee.com
Contraseña: 123456
Rol: CLIENTE
```

---

## 7. Iniciar sesión desde Swagger

En Swagger busca el controlador:

```text
auth-controller
```

Abre el endpoint:

```http
POST /api/auth/login
```

Presiona:

```text
Try it out
```

Para iniciar sesión como administrador, usa:

```json
{
  "correo": "admin@codffee.com",
  "contrasena": "123456"
}
```

Para iniciar sesión como cliente, usa:

```json
{
  "correo": "cliente@codffee.com",
  "contrasena": "123456"
}
```

Si el login es correcto, recibirás una respuesta parecida a esta:

```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "TOKEN_JWT",
  "tipoToken": "Bearer",
  "id": 1,
  "nombre": "Administrador Codffee",
  "correo": "admin@codffee.com",
  "rol": "ADMIN"
}
```

Copia el valor del campo:

```json
"token"
```

No copies las comillas.

---

## 8. Autorizar Swagger con JWT

En la parte superior derecha de Swagger presiona:

```text
Authorize
```

Pega el token con el siguiente formato:

```text
Bearer TOKEN_JWT
```

Después presiona:

```text
Authorize
```

Y luego:

```text
Close
```

A partir de ese momento Swagger enviará el token en las peticiones protegidas.

---

## 9. Probar productos disponibles

Para consultar los productos disponibles, busca el endpoint:

```http
GET /api/productos/disponibles
```

Presiona:

```text
Try it out
```

Luego:

```text
Execute
```

Este endpoint puede ser consultado por usuarios cliente, personal o administrador.

---

## 10. Crear un pedido

Primero inicia sesión como cliente:

```json
{
  "correo": "cliente@codffee.com",
  "contrasena": "123456"
}
```

Autoriza Swagger con el token del cliente.

Después busca el endpoint:

```http
POST /api/pedidos
```

Usa un JSON como este:

```json
{
  "usuarioId": 3,
  "metodoPago": "EFECTIVO",
  "observaciones": "Pasaré por el pedido en el receso",
  "productos": [
    {
      "productoId": 1,
      "cantidad": 1
    },
    {
      "productoId": 2,
      "cantidad": 1
    }
  ]
}
```

Notas importantes:

- `usuarioId` debe corresponder al ID del cliente.
- `productoId` debe corresponder a productos existentes.
- La cantidad no debe superar el stock disponible.

Si el pedido se crea correctamente, el sistema:

- Guarda el pedido.
- Guarda los detalles del pedido.
- Calcula el total.
- Descuenta stock.
- Envía un correo de confirmación al usuario.

---

## 11. Consultar pedidos

Para consultar pedidos, usa:

```http
GET /api/pedidos
```

Este endpoint está protegido y requiere token.

También puedes consultar un pedido específico:

```http
GET /api/pedidos/{id}
```

O consultar sus detalles:

```http
GET /api/pedidos/{pedidoId}/detalles
```

---

## 12. Cambiar estado de un pedido

Para cambiar el estado de un pedido, inicia sesión como administrador o personal.

Puedes usar la cuenta de personal:

```json
{
  "correo": "personal@codffee.com",
  "contrasena": "123456"
}
```

Autoriza Swagger con el token correspondiente.

Luego usa el endpoint:

```http
PUT /api/pedidos/{pedidoId}/estado/{estado}
```

Estados válidos:

```text
PENDIENTE
EN_PREPARACION
LISTO
ENTREGADO
CANCELADO
```

Ejemplo:

```text
pedidoId: 1
estado: LISTO
```

Cuando el estado cambia, el sistema envía un correo de actualización al usuario.

---

## 13. Cancelar un pedido

Para cancelar un pedido usa:

```http
PUT /api/pedidos/{pedidoId}/cancelar
```

El sistema realizará lo siguiente:

- Cambiará el estado del pedido a `CANCELADO`.
- Regresará el stock de los productos.
- Enviará correo de cancelación al usuario.

No se puede cancelar un pedido que ya fue marcado como `ENTREGADO`.

---

## 14. Probar envío de correo

El sistema envía correos automáticamente en estos casos:

- Cuando se crea un pedido.
- Cuando cambia el estado de un pedido.
- Cuando se cancela un pedido.

También existe un endpoint de prueba:

```http
POST /api/correos/prueba
```

Parámetro:

```text
destinatario
```

Ejemplo:

```text
destinatario=tu_correo@gmail.com
```

Si la configuración SMTP es correcta, llegará un correo de prueba.

---

## 15. Generar reporte PDF general

Para generar un reporte general de pedidos, inicia sesión como administrador:

```json
{
  "correo": "admin@codffee.com",
  "contrasena": "123456"
}
```

Autoriza Swagger con el token.

Luego usa:

```http
GET /api/reportes/pedidos/pdf
```

Swagger descargará un archivo PDF con el reporte de pedidos.

---

## 16. Generar reporte PDF filtrado

También puedes generar un reporte filtrado por fechas y estado.

Usa el endpoint:

```http
GET /api/reportes/pedidos/pdf/filtrado
```

Parámetros:

```text
fechaInicio
fechaFin
estado
```

Ejemplo:

```text
fechaInicio=2026-01-01
fechaFin=2026-12-31
estado=ENTREGADO
```

El parámetro `estado` es opcional. Si lo dejas vacío, el reporte incluirá todos los estados dentro del rango de fechas.

Estados válidos:

```text
PENDIENTE
EN_PREPARACION
LISTO
ENTREGADO
CANCELADO
```

---

## 17. Roles y permisos principales

### ADMIN

Puede acceder a:

- Usuarios
- Categorías
- Productos
- Pedidos
- Reportes

### PERSONAL

Puede acceder principalmente a:

- Categorías
- Productos
- Pedidos
- Cambio de estado de pedidos

### CLIENTE

Puede acceder principalmente a:

- Productos disponibles
- Categorías activas
- Creación de pedidos
- Consulta de pedidos permitidos

---

## 18. Detener el proyecto

Para detener los contenedores ejecuta:

```bash
docker compose down
```

---

## 19. Reiniciar desde cero

Si quieres borrar la base de datos del contenedor y volver a crear todo desde cero, ejecuta:

```bash
docker compose down -v
docker compose up --build
```

Esto eliminará el volumen de MySQL y el sistema volverá a crear usuarios, categorías y productos iniciales.

---

## 20. Ver logs

Para ver los logs del backend:

```bash
docker logs codffee-backend
```

Para verlos en tiempo real:

```bash
docker logs -f codffee-backend
```

Para ver los logs de MySQL:

```bash
docker logs codffee-mysql
```

---

## 21. Problemas comunes

### Swagger no abre

Verifica que los contenedores estén activos:

```bash
docker ps
```

También revisa los logs:

```bash
docker logs codffee-backend
```

### Error de conexión a MySQL

Asegúrate de que el servicio de MySQL esté activo:

```bash
docker ps
```

También puedes reiniciar todo:

```bash
docker compose down
docker compose up --build
```

### No llegan correos

Revisa que en `.env` estén bien configurados:

```env
SPRING_MAIL_USERNAME=TU_CORREO@gmail.com
SPRING_MAIL_PASSWORD=TU_PASSWORD_DE_APLICACION
```

Si usas Gmail, recuerda que debes utilizar una contraseña de aplicación.

### Error 403 Forbidden

Significa que el usuario inició sesión correctamente, pero su rol no tiene permiso para acceder al endpoint solicitado.

Por ejemplo, un usuario `CLIENTE` no puede acceder a:

```http
GET /api/usuarios
```

Ese endpoint requiere rol `ADMIN`.

---

## 22. Flujo recomendado para demostrar el proyecto

Para una presentación o revisión, se recomienda probar este flujo:

1. Levantar el proyecto con Docker.
2. Abrir Swagger UI.
3. Iniciar sesión como cliente.
4. Consultar productos disponibles.
5. Crear un pedido.
6. Verificar que se envía el correo de confirmación.
7. Iniciar sesión como personal.
8. Cambiar el estado del pedido a `LISTO`.
9. Verificar que se envía correo de actualización.
10. Iniciar sesión como administrador.
11. Generar reporte PDF general.
12. Generar reporte PDF filtrado.

---

## 23. Comandos principales

Levantar el proyecto:

```bash
docker compose up --build
```

Detener el proyecto:

```bash
docker compose down
```

Borrar datos y reconstruir desde cero:

```bash
docker compose down -v
docker compose up --build
```

Ver contenedores activos:

```bash
docker ps
```

Ver logs del backend:

```bash
docker logs -f codffee-backend
```

---

## 24. Notas finales

- El proyecto está preparado para ejecutarse con Docker.
- MySQL se ejecuta en un contenedor.
- El backend se ejecuta en otro contenedor.
- Los datos iniciales se crean automáticamente.
- Swagger UI permite probar toda la API.
- Las contraseñas se almacenan cifradas con BCrypt.
- La autenticación se realiza mediante JWT.
- Los reportes se generan en PDF.
- Las notificaciones se envían por correo.
