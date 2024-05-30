Cypress.Commands.add("getToken", (user, passwd) => {
  cy.request({
    method: "POST",
    url: "/signin",
    body: {
      email: user,
      redirecionar: false,
      senha: passwd,
    },
  })
    .its("body.token")
    .should("not.be.empty")
    .then((token) => {
      return token;
    });
});

Cypress.Commands.add("resetRest", (token) => {
  cy.request({
    method: "GET",
    url: "/reset",
    headers: { Authorization: `JWT ${token}` },
  });
});

Cypress.Commands.add("getAccountByName", (name, token) => {
  cy.request({
    method: "GET",
    url: "/contas",
    headers: { Authorization: `JWT ${token}` },
    qs: {
      nome: name,
    },
  }).then((resp) => {
    return resp;
  });
});

Cypress.Commands.add('getTransactionsByDescriptions', (description, token) => {
  cy.request({
    method: "GET",
    url: "/transacoes",
    headers: { Authorization: `JWT ${token}` },
    qs: {descricao: description}
  }).then(resp =>{
    return resp;
  })
})