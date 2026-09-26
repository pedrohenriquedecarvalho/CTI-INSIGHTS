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
@Table (name = "Insight")
public class Insihts {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column (name = "id_insight")
    private Long idinsight;

    @Column (name = "tipo",nullable = false, length = 150)
    private String tipo;

    @column (name = "descriacao", length = 300)
    private String descriacao;

    // Relacionamento

    @OneToMany(mappedBy = "insights")
    private List<Contrato> contrato = new ArrayList<>();

   public Insiht(String tipo, String descricao){
        this.tipo = tipo;
        this.descricao = descriacao;
    }

    public Long getIdLong(){
        return idInsight;
    }

    public void setIdConsultor(Long idInsight){
        this.idInsight = idInsight;
    }

    public String getTipo(){
        return tipo;
    }

    public void setTipo(String tipo){
        this.tipo = tipo;
    }

    public String getDescricao(){
        return descriacao;
    }

    public void setDescricao(String tipo){
        this.descriacao = descriacao;
    }

    public List<Contrato> getContrato(){
        return contrato;
    }

    public  void setContrato(List<Contrato>contrato){
    this.contrato = contrato;
    }
    

}