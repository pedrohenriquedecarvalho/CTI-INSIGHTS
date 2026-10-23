package com.senai.cti_insights.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senai.cti_insights.models.Cliente;
import com.senai.cti_insights.service.ClienteService;

// Arquivo controller é responsável por realizar as requisições http da API

@RestController // indica que a classe ClienteController irá receber as requisições http
@RequestMapping("/clientes") // cria a rota clientes
public class ClienteController {

    // Cria a variável ClienteService
    private final ClienteService service;

    // Cria o construtor
    public ClienteController(ClienteService service) {
        this.service = service;
    }

    // =======
    // CREATE
    // =======
    @PostMapping
    public Cliente criar(@RequestBody Cliente cliente) {
        return service.criar(cliente);
    }

    // =======
    // READ
    // =======
    @GetMapping
    public List<Cliente> listar() {
        return service.listar();
    }

    // =============
    // READ POR ID
    // =============
    @GetMapping("/{id}")
    public Cliente buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    // =======
    // UPDATE
    // =======
    @PutMapping("/{id}")
    public Cliente atualizar(@PathVariable Long id, @RequestBody Cliente cliente) {
        return service.atualizar(id, cliente);
    }

    // =======
    // DELETE
    // =======
    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}