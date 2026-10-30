
package com.senai.cti_insights.service;

import com.senai.cti_insights.dto.CadastroRequest;
import com.senai.cti_insights.dto.LoginRequest;
import com.senai.cti_insights.dto.LoginResponse;
import com.senai.cti_insights.dto.UsuarioResponse;

import com.senai.cti_insights.models.Perfil;
import com.senai.cti_insights.models.StatusConta;
import com.senai.cti_insights.models.Usuario;

import com.senai.cti_insights.repository.UsuarioRepository;
import com.senai.cti_insights.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UsuarioRepository repository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository repository,
            PasswordEncoder encoder,
            JwtService jwtService) {

        this.repository = repository;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    // CADASTRO
    @Transactional
    public UsuarioResponse cadastrar(CadastroRequest dados) {

        String nome = dados.nome().trim();
        String email = dados.email().trim().toLowerCase();

        if (repository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "E-mail já cadastrado."
            );
        }

        Usuario usuario = new Usuario();

        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenhaHash(encoder.encode(dados.senha()));

        // Todo cadastro público começa como usuário comum
        usuario.setPerfil(Perfil.USER);

        // Todo cadastro precisa de aprovação
        usuario.setStatus(StatusConta.PENDENTE);

        Usuario salvo = repository.save(usuario);

        return UsuarioResponse.de(salvo);
    }

    // LOGIN
    @Transactional(readOnly = true)
    public LoginResponse entrar(LoginRequest dados) {

        String email = dados.email().trim().toLowerCase();

        Usuario usuario = repository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "E-mail ou senha incorretos."
                ));

        // Confere a senha
        if (!encoder.matches(dados.senha(), usuario.getSenhaHash())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "E-mail ou senha incorretos."
            );
        }

        // Bloqueia status nulo ou diferente de ATIVO
        if (usuario.getStatus() != StatusConta.ATIVO) {

            if (usuario.getStatus() == StatusConta.PENDENTE) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Sua conta está aguardando aprovação."
                );
            }

            if (usuario.getStatus() == StatusConta.BLOQUEADO) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Sua conta foi bloqueada."
                );
            }

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso não liberado para esta conta."
            );
        }

        // Gera token somente para usuários ativos
        String token = jwtService.gerar(usuario);

        return new LoginResponse(
                token,
                "Bearer",
                UsuarioResponse.de(usuario)
        );
    }
}
