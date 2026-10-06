package com.senai.cti_insights.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.senai.cti_insights.models.Cliente;

// Interface que permite manipular a tabela cliente no banco de dados
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

}