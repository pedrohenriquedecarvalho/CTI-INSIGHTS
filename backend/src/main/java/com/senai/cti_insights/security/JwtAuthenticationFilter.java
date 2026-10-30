
package com.senai.cti_insights.security;

import com.senai.cti_insights.models.Usuario;
import com.senai.cti_insights.repository.UsuarioRepository;
import com.senai.cti_insights.models.StatusConta;

import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final UsuarioRepository repository;

    public JwtAuthenticationFilter(
            JwtService jwt,
            UsuarioRepository repository) {

        this.jwt = jwt;
        this.repository = repository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        String cabecalho = request.getHeader("Authorization");

        if (cabecalho != null && cabecalho.startsWith("Bearer ")) {

            String token = cabecalho.substring(7);

            try {
                // Valida assinatura e expiração do token
                String email = jwt.extrairEmailValidado(token);

                Usuario usuario = repository
                        .findByEmailIgnoreCase(email)
                        .orElse(null);

                if (usuario == null) {
                    SecurityContextHolder.clearContext();
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }

                // Somente usuários ativos podem acessar rotas protegidas
                if (usuario.getStatus() != StatusConta.ATIVO) {
                    SecurityContextHolder.clearContext();
                    response.sendError(HttpServletResponse.SC_FORBIDDEN,
                            "Sua conta não está ativa.");
                    return;
                }

                // Verifica se já existe autenticação
                if (SecurityContextHolder.getContext().getAuthentication() == null) {

                    // Converte o perfil em autoridade do Spring Security
                    var autoridades = List.of(
                            new SimpleGrantedAuthority(
                                    "ROLE_" + usuario.getPerfil().name()
                            )
                    );

                    var autenticacao =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    autoridades
                            );

                    SecurityContextHolder.getContext()
                            .setAuthentication(autenticacao);
                }

            } catch (JwtException | IllegalArgumentException ex) {

                // Token inválido ou expirado
                SecurityContextHolder.clearContext();

                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Token inválido ou expirado."
                );

                return;
            }
        }

        chain.doFilter(request, response);
    }
}
