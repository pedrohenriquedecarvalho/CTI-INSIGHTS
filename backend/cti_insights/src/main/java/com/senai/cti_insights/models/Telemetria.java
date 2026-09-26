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
@Table (name = "Telemetria")
public class Telemetria {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column (name = "id_telemetria")
    private Long idtelemetria;

    @Column (name = "evento",nullable = true, length = 150)
    private String evento;

    @column (name = "dataHora",nullable = true)
    private LocalDateTime dataHora;

    @column (name = "mensagem",nullable = true, lenght = 200)
    private String mensagem;

     public Insiht(String evento, LocalDateTime dataHora, String mensagem){
        this.evento = evento;
        this.dataHora = dataHora;
        this.mensagem = mensagem;
    }

    public Long getIdLong(){
        return idTelemetria;
    }

    public void setIdConsultor(Long idTelemetria){
        this.idInsight = idTelemetria;
    }

    public String getEvento(){
        return evento;
    }

    public void setEvento(String Evento){
        this.evento = evento;
    }

    public LocalDateTime getDataHora(){
        return getHora;
    }

    public void setDataHora(LocalDateTime dataHora){
        this.dataHora = dataHora;
    }

    public String getMensagem(){
        return mensagem;
    }

    public void setMensagem(String mensagem){
        this.mensagem = mensagem;
    }
}