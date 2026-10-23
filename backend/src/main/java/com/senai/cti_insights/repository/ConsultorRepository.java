package com.senai.cti_insights.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.senai.cti_insights.models.Consultor;



// interface é uma especie de contrato , o metodo implementado nela sera herdado para outra classe
public interface ConsultorRepository extends JpaRepository<Consultor,Long> {
   
   // Pelo email irá verificar se o consultor existe ou não
    Optional<Consultor>findByEmail(String email);
    
}
