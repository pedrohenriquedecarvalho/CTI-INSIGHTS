package com.senai.cti_insights.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Telemetria")
public class Telemetria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_telemetria")
    private Long idTelemetria;

    @Column(name = "evento", nullable = true, length = 150)
    private String evento;

    @Column(name = "dataHora", nullable = true)
    private LocalDateTime dataHora;

    @Column(name = "mensagem", nullable = true, length = 200)
    private String mensagem;

    // JPA exige um construtor vazio
    public Telemetria() {
    }

    public Telemetria(String evento, LocalDateTime dataHora, String mensagem) {
        this.evento = evento;
        this.dataHora = dataHora;
        this.mensagem = mensagem;
    }

    public Long getIdTelemetria() {
        return idTelemetria;
    }

    public void setIdTelemetria(Long idTelemetria) {
        this.idTelemetria = idTelemetria;
    }

    public String getEvento() {
        return evento;
    }

    public void setEvento(String evento) {
        this.evento = evento;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }
}