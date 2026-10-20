package com.senai.cti_insights.repository;

import com.senai.cti_insights.models.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

// O Spring Data JPA implementa os métodos de acesso ao banco.
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}