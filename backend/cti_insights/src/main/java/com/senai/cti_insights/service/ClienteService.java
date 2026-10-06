package com.senai.cti_insights.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.senai.cti_insights.models.Cliente;
import com.senai.cti_insights.models.Consultor;
import com.senai.cti_insights.repository.ClienteRepository;
import com.senai.cti_insights.repository.ConsultorRepository;

import jakarta.transaction.Transactional;

// Anotação de service é onde vão ficar as regras de negócio

@Service
public class ClienteService {

    private final ClienteRepository repository;
    private final ConsultorRepository consultorRepository;

    // Cria o construtor
    public ClienteService(ClienteRepository repository, ConsultorRepository consultorRepository) {
        this.repository = repository;
        this.consultorRepository = consultorRepository;
    }

    // =======
    // CREATE
    // =======

    @Transactional
    public Cliente criar(Cliente cliente) {
        if (cliente.getNomeEmpresa() == null || cliente.getNomeEmpresa().isBlank()) {
            throw new RuntimeException("Nome da empresa é obrigatório !");
        }

        if (cliente.getSegmento() == null || cliente.getSegmento().isBlank()) {
            throw new RuntimeException("Segmento é obrigatório !");
        }

        if (cliente.getFaturamentoAnual() == null) {
            throw new RuntimeException("Faturamento anual é obrigatório !");
        }

        if (cliente.getNivel() == null) {
            throw new RuntimeException("Nível é obrigatório !");
        }

        if (cliente.getStatus() == null) {
            throw new RuntimeException("Status é obrigatório !");
        }

        if (cliente.getConsultor() == null || cliente.getConsultor().getIdLong() == null) {
            throw new RuntimeException("Consultor é obrigatório !");
        }

        // Busca o consultor no banco para vincular ao cliente
        Consultor consultor = consultorRepository.findById(cliente.getConsultor().getIdLong())
                .orElseThrow(() -> new RuntimeException("Consultor não encontrado"));
        cliente.setConsultor(consultor);

        return repository.save(cliente);
    }

    // =======
    // READ - todos
    // =======

    public List<Cliente> listar() {
        return repository.findAll();
    }

    // =======
    // READ por ID
    // =======

    public Cliente buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }

    // =======
    // UPDATE
    // =======

    @Transactional
    public Cliente atualizar(Long id, Cliente dados) {
        Cliente cliente = buscarPorId(id);

        cliente.setNomeEmpresa(dados.getNomeEmpresa());
        cliente.setSegmento(dados.getSegmento());
        cliente.setFaturamentoAnual(dados.getFaturamentoAnual());
        cliente.setNivel(dados.getNivel());
        cliente.setStatus(dados.getStatus());

        return repository.save(cliente);
    }

    // =======
    // DELETE
    // =======

    @Transactional
    public void excluir(Long id) {
        Cliente cliente = buscarPorId(id);

        repository.deleteById(cliente.getIdCliente());
    }
}