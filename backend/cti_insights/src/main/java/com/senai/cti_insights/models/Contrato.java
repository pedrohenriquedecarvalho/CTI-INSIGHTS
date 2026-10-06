package com.senai.cti_insights.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Contratos")
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contrato")
    private Long idContrato;

    // O nome do campo precisa ser "servico" para bater com o mappedBy de Servico
    @ManyToOne
    @JoinColumn(name = "id_servico")
    private Servico servico;

    // O nome do campo precisa ser "insight" para bater com o mappedBy de Insight
    @ManyToOne
    @JoinColumn(name = "id_insight")
    private Insight insight;

    // Construtor vazio (obrigatório para o JPA)
    public Contrato() {
    }

    public Long getIdContrato() {
        return idContrato;
    }

    public void setIdContrato(Long idContrato) {
        this.idContrato = idContrato;
    }

    public Servico getServico() {
        return servico;
    }

    public void setServico(Servico servico) {
        this.servico = servico;
    }

    public Insight getInsight() {
        return insight;
    }

    public void setInsight(Insight insight) {
        this.insight = insight;
    }
}