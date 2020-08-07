const express = require('express');
const { uuid, isUuid } = require("uuidv4");
const { request } = require("express");

const app = express();

app.use(express.json());

const transactions = [];

function logRequests(request, response, next) {
    const { method, url } = request;

    const logLabel = `[ ${method.toUpperCase()} ${url} ]`

    console.log(logLabel);

    next();
}

function validaId(request, response, next) {
    const { id } = request.params;

    if(!isUuid(id)) {
        return response.status(400).json({
            error: "Uuid enviado como parâmetro de rota, não é válido!"
        })
    }

    next();
}

app.use(logRequests);
app.use("/projects/:id", validaId);

app.post('/projects', (request, response) => { //Cria a transação, to pensando no melhor jeito de fazer 
    const { title, value, type } = request.body;

    const transaction = { id: uuid(), title, value, type };

    transactions.push(transaction);

    return response.json(transaction);
});  

app.get('/projects', (request, response) => { //Lista as transações cadastradas
    const { title } = request.query;

    const getTransactions = title 
        ? transactions.filter(transaction => 
            transaction.title.toLowerCase().includes(title.toLowerCase()))
        : transactions;    

        return response.json(getTransactions);
});

app.put('/projects/:id', (request, response) => { //Edita as transações
    const { id } = request.params;
    const { title, value, type } = request.body;

    const transactionIndex = transactions.findIndex(transaction => transaction.id == id);

    if(transactionIndex < 0) {
        return response.status(400).json({
            error: "Transaction not found"
        });
    }

    const transaction = {
        id,
        title,
        value,
        type
    };

    transactions[transactionIndex] = transaction;

    return response.json(transaction);
});

app.delete('/projects/:id', (request, response) => { //Deleta as transações
    const { id } = request.params;
    const { title, value, type } = request.params;

    const transactionIndex = transactions.findIndex(transaction => transaction.id == id);

    if(transactionIndex < 0) {
        return response.status(400).json({ //código de erro caso o id seja inválido
            error: "Transaction not found"
        });
    }

    transactions.splice(transactionIndex, 1);

    return response.status(204).send(); //código de sucesso, resposta vazia.
});

const port = 3333;
app.listen(port, () => {
    console.log(`Server up nd running on PORT ${port}`)
});
