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
      Cypress.env('token', token)
      return token;
    });
});

Cypress.Commands.add("resetRest", () => {
  cy.request({
    method: "GET",
    url: "/reset",
  });
});

Cypress.Commands.add("getAccountByName", (name) => {
  cy.request({
    method: "GET",
    url: "/contas",
    qs: {
      nome: name,
    },
  }).then((resp) => {
    return resp;
  });
});

Cypress.Commands.add('getTransactionsByDescriptions', (description) => {
  cy.request({
    method: "GET",
    url: "/transacoes",
    qs: {descricao: description}
  }).then(resp =>{
    return resp;
  })
})

Cypress.Commands.overwrite('request', (originalFn, ...options) =>{
  if(options.length === 1) {
    if(Cypress.env('token')) {
      options[0].headers = {
        Authorization: `JWT ${Cypress.env('token')}`
      }
    }
  }

  return originalFn(...options)
})