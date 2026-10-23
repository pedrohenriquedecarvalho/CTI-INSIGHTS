package com.senai.cti_insights.service;

import java.util.List;

import org.springframework.stereotype.Service; // Biblioteca que permite colocar a anotação service

import com.senai.cti_insights.models.Consultor;
import com.senai.cti_insights.repository.ConsultorRepository;

import jakarta.transaction.Transactional;

// Anotação de service é onde vai ter as regras de negócio

@Service
public class ConsultorService {

    // Cria a variável ConsultorRepository
    private final ConsultorRepository repository; // permite manipular o banco de dados

    // Cria o construtor
    public ConsultorService(ConsultorRepository repository) {
        this.repository = repository;
    }

    // =======
    // CREATE
    // =======

    @Transactional
    public Consultor criar(Consultor consultor) {
        if (consultor.getNome() == null || consultor.getNome().isBlank()) {
            throw new RuntimeException("Nome é obrigatório !");
        }

        if (consultor.getEmail() == null || consultor.getEmail().isBlank()) {
            throw new RuntimeException("Email é obrigatório !");
        }

        if (consultor.getSenha() == null || consultor.getSenha().isBlank()) {
            throw new RuntimeException("Senha é obrigatória !");
        }

        // Verifica se já existe consultor com o mesmo email
        if (repository.findByEmail(consultor.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        return repository.save(consultor);
    }

    // =======
    // LOGIN
    // =======

    public Consultor login(String email, String senha) {
        Consultor consultor = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Consultor não encontrado"));

        // Validação
        if (!consultor.getSenha().equals(senha)) {
            throw new RuntimeException("Senha inválida!");
        }

        return consultor;
    }

    // =======
    // READ - todos
    // =======

    public List<Consultor> listar() {
        return repository.findAll();
    }

    // =======
    // READ por ID
    // =======

    public Consultor buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultor não encontrado"));
    }

    // =======
    // UPDATE
    // =======

    @Transactional
    public Consultor atualizar(Long id, Consultor dados) {
        Consultor consultor = buscarPorId(id);

        consultor.setNome(dados.getNome());
        consultor.setEmail(dados.getEmail());
        consultor.setSenha(dados.getSenha());

        return repository.save(consultor);
    }

    // =======
    // DELETE
    // =======

    @Transactional
    public void excluir(Long id) {
        Consultor consultor = buscarPorId(id);

        repository.deleteById(consultor.getIdLong());
    }
}