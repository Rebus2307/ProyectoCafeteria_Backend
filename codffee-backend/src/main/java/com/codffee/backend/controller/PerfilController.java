package com.codffee.backend.controller;

import com.codffee.backend.dto.PerfilRequest;
import com.codffee.backend.dto.UsuarioResponse;
import com.codffee.backend.entity.Usuario;
import com.codffee.backend.service.UsuarioService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    private final UsuarioService usuarioService;

    public PerfilController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public UsuarioResponse obtenerPerfil(Authentication authentication) {
        String correo = authentication.getName();
        Usuario usuario = usuarioService.buscarPorCorreo(correo);
        return UsuarioResponse.fromEntity(usuario);
    }

    @PutMapping
    public UsuarioResponse actualizarPerfil(
            @RequestBody PerfilRequest perfilRequest,
            Authentication authentication
    ) {
        String correo = authentication.getName();
        Usuario usuario = usuarioService.buscarPorCorreo(correo);

        if (perfilRequest.getNombre() != null && !perfilRequest.getNombre().isBlank()) {
            usuario.setNombre(perfilRequest.getNombre());
        }

        usuario.setContrasena(perfilRequest.getContrasena());

        Usuario usuarioActualizado = usuarioService.actualizar(usuario.getId(), usuario);
        return UsuarioResponse.fromEntity(usuarioActualizado);
    }
}
