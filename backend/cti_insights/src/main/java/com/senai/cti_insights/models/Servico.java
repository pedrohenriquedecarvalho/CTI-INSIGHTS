package com.cti_insights.demo.models;

import java.util.ArrayList;
import java.util.List;


import org.hibernate.mapping.Array;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity 
@Table (name = "Servico")
public class Servico {
    
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column (name = "id_Servico")
    private Long idServico;


      // Cria coluna da tabela consultor

    @Column (name = "nome",nullable = false, length = 150)
    private String nome;

    @Column  (name = "categoria", nullable = false, length = 150)
    private String categoria;

    @OneToMany (mappedBy = "servico")
    private List<Contratos> contratos = new ArrayList<>(); // Lista, pois o consultor pode ter varios clientes

    // Cria o construtor cliente vazio, pois posso criar um cliente inicial sem passar parametros quando cria
    public Servico(){

    }

    public Servico(String nome, String categoria){
        this.nome = nome;
        this.categoria = categoria;
    }

    public Long getIDLong(){
        return idServico;
    }

    public void serIdServico(Long idServico){
        this.idServico = idServico;
    }

    public String getNome(){
        return nome;
    }

    public void setNome(String nome){
        this.nome = nome;
    }

    public String getCategoria(){
        return categoria;
    }

    public void setCategoria(String categoria){
        this.categoria = categoria;
    }

    public List<Contratos> getContratos(){
        return contratos;
    }

    public void setContratos(List<Contratos>contratos){
        this.contratos = contratos;
    }
    
}
