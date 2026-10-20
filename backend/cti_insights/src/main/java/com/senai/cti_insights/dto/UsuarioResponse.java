package com.senai.cti_insights.dto;

import com.senai.cti_insights.models.Perfil;
import com.senai.cti_insights.models.Usuario;

// DTO de saída: nunca inclui senha nem hash.
public record UsuarioResponse(Long id, String nome, String email, Perfil perfil) {
    public static UsuarioResponse de(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getPerfil());
    }
}