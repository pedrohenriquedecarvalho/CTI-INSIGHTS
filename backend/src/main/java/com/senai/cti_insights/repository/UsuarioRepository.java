package com.senai.cti_insights.repository;

import com.senai.cti_insights.models.Usuario;
import com.senai.cti_insights.models.StatusConta;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<Usuario> findByEmailIgnoreCase(String email);

    List<Usuario> findByStatus(StatusConta status);
}