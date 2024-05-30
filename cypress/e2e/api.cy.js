/// <reference types="Cypress"/>
const dayjs = require("dayjs");
describe("Teste de API", () => {
  let token;

  before(() => {
    cy.getToken("a@a", "a").then((tkn) => {
      token = tkn;
    });
  });

  beforeEach(() => {
    cy.resetRest(token);
  });
  it("Criar uma conta", () => {
    cy.request({
      method: "POST",
      url: "/contas",
      headers: { Authorization: `JWT ${token}` },
      body: {
        nome: "teste via api",
      },
    }).as("response");

    cy.get("@response").then((res) => {
      expect(res.status).to.be.equal(201);
      expect(res.body).to.have.property("id");
      expect(res.body).to.have.property("nome", "teste via api");
    });
  });

  it("Alterar uma conta", () => {
    cy.getAccountByName("Conta para alterar", token).then((resp) => {
      console.log("resp", resp.body[0].id);
      cy.request({
        url: `/contas/${resp.body[0].id}`,
        method: "PUT",
        headers: { Authorization: `JWT ${token}` },
        body: {
          nome: "conta alterada via api",
        },
      }).as("response");
    });
    cy.get("@response").its("status").should("be.equal", 200);
  });

  it("Não deve criar uma conta com o mesmo nome", () => {
    cy.request({
      method: "POST",
      url: "/contas",
      headers: { Authorization: `JWT ${token}` },
      body: {
        nome: "Conta mesmo nome",
      },
      failOnStatusCode: false,
    }).as("response");

    cy.get("@response").then((res) => {
      expect(res.status).to.be.equal(400),
        expect(res.body.error).to.be.equal(
          "Já existe uma conta com esse nome!"
        );
      console.log(res);
    });
  });

  it("Deverá criar uma transação", () => {
    cy.getAccountByName("Conta para movimentacoes", token).then((resp) => {
      cy.request({
        method: "POST",
        url: "/transacoes",
        headers: { Authorization: `JWT ${token}` },
        body: {
          conta_id: resp.body[0].id,
          data_pagamento: dayjs().add(1, "day").format("DD/MM/YYYY"),
          data_transacao: dayjs().format("DD/MM/YYYY"),
          descricao: "Inserindo uma movimentação",
          envolvido: "Teste",
          status: true,
          tipo: "REC",
          valor: "100",
        },
      }).as("response");
    });

    cy.get("@response").its("status").should("be.equal", 201);
  });

  it("Deverá realizar o cálculo de saldo", () => {
    cy.getTransactionsByDescriptions('Movimentacao 1, calculo saldo', token).then(resp => {
      cy.request({
        method: "PUT",
        url:`/transacoes/${resp.body[0].id}`,
        headers: { Authorization: `JWT ${token}` },
        body: {
          conta_id: resp.body[0].conta_id,
          data_pagamento: dayjs(resp.body[0].data_pagamento).format("DD/MM/YYYY"),
          data_transacao:dayjs(resp.body[0].data_transacao).format("DD/MM/YYYY"),
          descricao: "Movimentacao 1, calculo saldo",
          envolvido: "CCC",
          observacao: null,
          parcelamento_id: null,
          status: true,
          tipo: "REC",
          transferencia_id: null,
          usuario_id: 1,
          valor: "3500.00",
        },
      }).its('status').should('be.equal', 200)
    })
    cy.request({
      method: "GET",
      url: "/saldo",
      headers: { Authorization: `JWT ${token}` },
    }).then((resp) => {
      let saldoConta = null;
      resp.body.forEach((c) => {
        if (c.conta === "Conta para saldo") {
          saldoConta = c.saldo;
        }
      });

      expect(saldoConta).to.be.equal("4034.00");
    });
  });

  it.only('Deverá remover uma transação', () => {
    cy.getTransactionsByDescriptions('Movimentacao para exclusao', token)
    .then(resp => {
      cy.request({
        method: 'DELETE',
        url: `/transacoes/${resp.body[0].id}`,
        headers: { Authorization: `JWT ${token}` },
      }).its('status').should('be.equal', 204);
    })
  })
});
