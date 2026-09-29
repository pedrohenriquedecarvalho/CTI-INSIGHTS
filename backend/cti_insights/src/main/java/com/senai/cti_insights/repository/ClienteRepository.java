package com.senai.cti_insights.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.senai.cti_insights.models.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente,Long> {
    
}
