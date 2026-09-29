package com.senai.cti_insights.controller;

import java.util.List;

import org.hibernate.boot.model.internal.CreateKeySecondPass;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senai.cti_insights.models.Consultor;
import com.senai.cti_insights.service.ConsultorService;

import ch.qos.logback.core.net.LoginAuthenticator;

// Arquivo controller é responsável por realizar as requisições http da API

@RestController // indica que a classe consultor controller irá receber as requisições http
@RequestMapping("/consultores") // cria a rota consultores
public class ConsultorController {

    // Cria a variavel ConsultorService 
    private final ConsultorService service;

    // Cria o construtor
    public ConsultorController(
        ConsultorService service){
            this.service = service;
        }


// ======
//CREATE
// =======

@PostMapping
public Consultor criar(
    @RequestBody Consultor consultor){
        return service.cirar(consultor);
    }

// =====
// LOGIN
//

@PostMapping ("/login")
public Consultor login(@RequestBody Consultor consultor){
    return service.login(consultor.getEmail(), consultor.getSenha())
}

// ==== 
// READ 
// ====

@GetMapping 
public List<Consultor> listar(){
    return service.listar();
}


// ====
// READ POR ID
// =====

@GetMapping ("/{id}")
public Consultor buscar(@PathVariable Long id){
    return service.buscarPorId(id);
}


// =====
// UPDATE
// =====

@PutMapping ("/{id}")
public Consultor atualizar(@PathVariable Long id, @RequestBody Consultor consultor){
    return service.atualizar(id, consultor);
}

// =====
// DELETE
// =====

@DeleteMapping ("/{id}")
public void excluir (@PathVariable Long id){
    service.excluir(id);
}
}

