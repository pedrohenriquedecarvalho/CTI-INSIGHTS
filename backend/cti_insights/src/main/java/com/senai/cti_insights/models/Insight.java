package com.senai.cti_insights.models;


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
public class Insight {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column (name = "id_insight")
    private Long idinsight;

    @Column (name = "tipo",nullable = true, length = 150)
    private String tipo;

    @Column (name = "descricao", length = 300)
    private String descricao;

    // Relacionamento

    @OneToMany(mappedBy = "insight")
    private List<Contrato> contrato = new ArrayList<>();

   public Insight(String tipo, String descricao){
        this.tipo = tipo;
        this.descricao = descricao;
    }

    public Long getIdLong(){
        return idinsight;
    }

    public void setIdConsultor(Long idInsight){
        this.idinsight = idInsight;
    }

    public String getTipo(){
        return tipo;
    }

    public void setTipo(String tipo){
        this.tipo = tipo;
    }

    public String getDescricao(){
        return descricao;
    }

    public void setDescricao(String tipo){
        this.descricao = descricao;
    }

    public List<Contrato> getContrato(){
        return contrato;
    }

    public  void setContrato(List<Contrato>contrato){
    this.contrato = contrato;
    }
    

}