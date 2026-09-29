package com.senai.cti_insights.service;

import org.springframework.stereotype.Service;

import com.senai.cti_insights.models.Cliente;
import com.senai.cti_insights.models.Consultor;
import com.senai.cti_insights.repository.ClienteRepository;
import com.senai.cti_insights.repository.ConsultorRepository;

import jakarta.transaction.Transactional;

public class ClienteService {
    
    // Cria variaveis clienterepository e consultorrepository

    private  final ClienteRepository clienteRepository;
    private  final ConsultorRepository consultorRepository;

    // Cria o construtor
    public ClienteService(
        ClienteRepository clienteRepository,
        ConsultorRepository consultorRepository

    ){
        this.clienteRepository = clienteRepository;
        this.consultorRepository = consultorRepository;
    }


    // CREATE 

    @Transactional 
    public Cliente criar(Long idConsultor, Cliente cliente){
        
        // Primeiro verifica se o consultor existe

        Consultor consultor = consultorRepository.findById(idConsultor).orElseThrow(()->new RuntimeException("consultor não encontrado"));

        // Validação simples 

        if(cliente.getNomeEmpresa()== null || cliente.getNomeEmpresa().isBlank()){
            throw new RuntimeException("Nome da empresa é obrigatório");
        }

        if(cliente.getSegmento()==null || cliente.getSegmento().isBlank()){
            throw new RuntimeException(
                "Segmento é obrigatório"
            );
        }


        if(cliente.getFaturamentoAnual()==null){
            throw new RuntimeException("Faturamento anual é obrigatório");
        }


        // Associa o consultor encontrado ao cliente

        cliente.setConsultor(consultor);

        // Agora salva

        return clienteRepository.save(cliente);
    }

    // read por id

    public Cliente buscarporId(Long id){
        return clienteRepository.findById(id).orElseThrow(()->new RuntimeException("Cliente não encontrado"));

    }

    // UPDATE

    @Transactional 
    public Cliente atualizar(Long id, Cliente dados){
        Cliente cliente = buscarporId(id);

        cliente.setNomeEmpresa(dados.getNomeEmpresa());

        cliente.setSegmento(dados.getSegmento());

        cliente.setFaturamentoAnual(dados.getFaturamentoAnual());
        cliente.setNivel(dados.getNivel());

        cliente.setStatus(dados.getStatus());
        return clienteRepository.save(cliente);
    }

    // Delete 

    @Transactional 
    public void excluir(Long id){
        Cliente cliente = buscarporId(id);

        clienteRepository.deleteById(cliente.getIdCliente());
    }
}
