
package com.senai.cti_insights.dto;

public record LoginResponse(
    String token,
    String tipo,
    UsuarioResponse usuario
) {}
