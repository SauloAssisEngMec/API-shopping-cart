# Desafio Técnico quero delivery

Candidato: Saulo assis silva

## Desafio:

Objetivo: Desenvolver uma API REST capaz de processar e armazenar eventos de compras feitas por usuários e fornecer estatísticas sobre essas compras.

História do Usuário: Como usuário, desejo visualizar um produto, adicionar ao carrinho de compras e finalizar a compra. Além disso, gostaria de acessar dados estatísticos sobre as compras.

### Observações e decisões...

Na História do Usuário foi citado partes importantes como, o User deve ser Capaz de:

- Vizualizar um produto;
- Adicionar produtos ao carrinho
- Finalizar a compra
- Acessar dados estatisco sobre as compras

A primeira consideração que tomei é que o usuario sera modelado implicitamente, ou seja, usando um UserID (uma vez que será necessário ser referenciado nos schemas das entidades modeladas, Carrinho, Produto etc..) ja que interpretei que o foco é apenas na Compra, Carrinho e estatisticas devido ao prazo de entrega curto.. Além disso, considerei isso tendo em vista que a modelagem explicita do user e os dados relacionados aos usuários sap geenciados separadamente em outra entidade independente com login, autenticação e autorização etc.

### Bibliotecas e ferramentas usadas no projeto

- Nestjs framework pra criar o servidor http no runtime nodejs.
- Mongodb como banco de dados juntamente com o ODM mongoose.
- Jest pra criar os testes automatizados
- Swagger pra documentar a API

#### Estatistica implementadas

- Quantidade de produtos comprados pelo cliente;
- Qual a data das ultimas compras;
- Preferências de compra do cliente: categoria;
- Valor médio das compra do cliente;
- Frequência de compra.

funcionalidades ( Endpoints) da API REST possui:

1. Listar todos os produtos

2. criei uma rota pra adicionar produto somente pra fins ilustrativo, já que inicialmente o mongoose estará vazio, como conteinarizei o mongo, preferir fazer isso do que utilizar um atlas com access network 000000 rsrsr)

3. Exibir um produto;

4. Adicionar produtos ao carrinho;

- é contra intuitivo inserir mais de um tipo de produto por vez porém preferir deixar mais completo que limitado

- pode ser inserir mais de n produtos de um tipo também (incremento)

4. Remover um produto do carrinho ( remove a quantidade inteira do produto);

5. Remover um produto do carrinho ( remove um por vez como um descremento);

6. Finalizar compra;

7. Mostrar estatística ao usuario.
