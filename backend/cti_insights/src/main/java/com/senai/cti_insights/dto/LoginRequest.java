package com.senai.cti_insights.dto;

import jakarta.validation.constraints.NotBlank;

// DTO com as credenciais enviadas pelo cliente.
public record LoginRequest(@NotBlank String email, @NotBlank String senha) {}
