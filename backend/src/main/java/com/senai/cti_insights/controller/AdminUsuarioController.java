
package com.senai.cti_insights.controller;

import com.senai.cti_insights.models.Usuario;
import com.senai.cti_insights.repository.UsuarioRepository;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/usuarios")
public class AdminUsuarioController {

    private final UsuarioRepository usuarioRepository;

    public AdminUsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public record UsuarioDTO(
        Long id,
        String nome,
        String email,
        String status
    ) {}

    // LISTAR TODOS OS USUÁRIOS
    @GetMapping
    public List<UsuarioDTO> listarTodos() {

        return usuarioRepository.findAll()
            .stream()
            .map(u -> new UsuarioDTO(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getStatus().name()
            ))
            .toList();
    }

    // DELETAR USUÁRIO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id) {

        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Usuário não encontrado."
            ));

        usuarioRepository.delete(usuario);

        return ResponseEntity.noContent().build();
    }
}
