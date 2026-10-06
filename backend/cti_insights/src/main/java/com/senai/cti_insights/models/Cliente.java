package com.senai.cti_insights.models;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity; // biblioteca para persistência de dados
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cliente") // Cria tabela chamada cliente
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long idCliente; // id do cliente

    // Relacionamento para consultor, então um consultor pode ter mais de um cliente
    @ManyToOne
    @JoinColumn(name = "id_consultor", nullable = false)
    private Consultor consultor; // Atributo consultor do tipo Consultor

    @Column(name = "nome_empresa", nullable = false, length = 180)
    private String nomeEmpresa;

    @Column(name = "segmento", nullable = false, length = 100)
    private String segmento;

    @Column(
        name = "faturamento_anual",
        nullable = false,
        precision = 15,
        scale = 2
    )
    private BigDecimal faturamentoAnual;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel", nullable = false)
    private NivelCliente nivel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusCliente status;

    // Construtor vazio para Cliente (obrigatório para o JPA)
    public Cliente() {
    }

    public Cliente(
            Consultor consultor,
            String nomeEmpresa,
            String segmento,
            BigDecimal faturamentoAnual,
            NivelCliente nivel,
            StatusCliente status) {
        this.consultor = consultor;
        this.nomeEmpresa = nomeEmpresa;
        this.segmento = segmento;
        this.faturamentoAnual = faturamentoAnual;
        this.nivel = nivel;
        this.status = status;
    }

    // Função para pegar o ID
    public Long getIdCliente() {
        return idCliente;
    }

    // Função para pegar o consultor
    public Consultor getConsultor() {
        return consultor;
    }

    // Função para setar o consultor
    public void setConsultor(Consultor consultor) {
        this.consultor = consultor;
    }

    // Função para pegar o nome da empresa
    public String getNomeEmpresa() {
        return nomeEmpresa;
    }

    // Função para setar o nome da empresa
    public void setNomeEmpresa(String nomeEmpresa) {
        this.nomeEmpresa = nomeEmpresa;
    }

    // Função para pegar o segmento
    public String getSegmento() {
        return segmento;
    }

    public void setSegmento(String segmento) {
        this.segmento = segmento;
    }

    // Função para pegar o faturamento
    public BigDecimal getFaturamentoAnual() {
        return faturamentoAnual;
    }

    public void setFaturamentoAnual(BigDecimal faturamentoAnual) {
        this.faturamentoAnual = faturamentoAnual;
    }

    public NivelCliente getNivel() {
        return nivel;
    }

    public void setNivel(NivelCliente nivel) {
        this.nivel = nivel;
    }

    public StatusCliente getStatus() {
        return status;
    }

    public void setStatus(StatusCliente status) {
        this.status = status;
    }
}