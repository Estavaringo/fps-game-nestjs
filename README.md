# Descrição

Projeto implementa um processador de logs para jogos de fps, capaz de analisar arquivos de log e gerar rankings de jogadores por partida e um ranking global.

## Tecnologias Utilizadas

* Node.js `v18.19.1`
* NestJS

# Arquitetura

Esse projeto foi montado a partir de camadas, utilizando a Clean Architeture como inspiração, mas com algumas variações.

Na camada mais interna estão as entidades de negócio, na pasta `entities` do módulo `game`. A ideia é que as outras camadas utilizem (dependam) das entidades, mas que as entidades não tenham nenhuma dependência com camadas mais externas.

Em uma camada mais acima estão os casos de uso, que são as services `log-parser`, `ranking` e `save-games`. Essas services dependem apenas da entidade e do repositório de jogos. A dependência com o repositório é feita apenas através de uma interface, mantendo essa camada desacoplada com as camadas mais externas.

Na camada exterior estão a `cli` service, que representa a conexão com o mundo externo, e também a implementação em memória do repositório. Nessa camada poderiam ter controllers para expor as funcionalidades do projeto através de uma API REST, por exemplo. Além disso, também poderia existir uma implementação do repositório para um banco SQL e isso não iria afetar a camada mais interna, comprovando o desacoplamento da arquitetura.

As separações em camadas não ficam tão visíveis na estrutura de pastas para deixar o código mais legível e simples de entender. Tanto a interface do repositório quanto as suas implementações estão dentro da pasta `repositories`, por exemplo. Isso melhora a navegabilidade do código e não fere os princípios de SOLID ou de Clean Architeture, pois os casos de uso ainda dependem apenas da interface.

# Funcionalidades

As seguintes funcionalidades foram implementadas no projeto:

* Parser de logs de jogos a partir de arquivo de texto
  * O parser é capaz de identificar partidas com times ou não
  * Partidas com mais de 20 jogadores são consideradas inválidas e não são salvas.
* Armazenamento das informações das partidas em memória
* Geração de ranking por partida e global
  * O ranking contém as seguintes informações:
    * Quantidade de frags
    * Quantidade de mortes
    * Arma favorita
    * Sequência de frags sem morrer
    * Prêmios
      * Somente o prêmio "Imortal" está implementado, que é dado quando um jogador termina a partida sem morrer.
* Interface via console para exibir rankings e passar arquivos de log para serem processados

# Observações

Por questões de simplicidade, esse projeto possui algumas implementações que estão um pouco diferentes da especificação.

* A arma preferida é definida para todos os jogadores do ranking que possuem pelo menos um frag.

* O killstreak no ranking global está sendo calculado como se todas as partidas fossem uma só.

* O prêmio "imortal" é dado a todos os jogadores que terminam uma partida sem morrer, independente se venceram ou não.

Além disso, existem alguns detalhes no parse de logs que merecem ser mencionados:

* Partidas sem logs de encerramento são ignoradas
* Logs de encerramento ou de mortes são ignorados se vierem antes de um log de início de partida
* Qualquer linha de log que foge do padrão definido no projeto é ignorada.
* Não existe uma validação de hora dos logs. Uma linha de frag com a hora menor do que a de início da partida é tida como válida, pois apenas é considerada a ordem das linhas.

## Como executar

### Instale as dependências

```bash
npm install
```

### Compilar e rodar o projeto

```bash
npm run start
```

O seguinte menu deve ser exibido no console

```
MENU:
1 - Upload log file
2 - Show rankings
3 - Show global ranking
4 - Exit

Enter your choice: 
```

#### Opção 1

Ao selecionar a opção 1, será solicitado o caminho do arquivo de logs. Na pasta `data/log_examples` Existem 2 exemplos de arquivos de logs aceitos nesse projeto.

O caminho informado deve ser relativo a raíz do projeto. Ou seja, se o arquivo estiver na raíz do projeto, basta digitar o nome do arquivo.

Exemplo usando os arquivos presentes nesse repositório:

```
Enter the log file path: data/log_examples/logfile.txt
```

Se tudo ocorrer bem, você deverá ver duas mensagens de sucesso no console.

```
File content read successfully.
Log file processing completed.
```

Você pode fazer o upload de quantos arquivos de log quiser.

#### Opção 2

Ao selecionar a opção 2, serão calculados os rankings de todas as partidas que foram previamente processadas através dos arquivos de logs passados na opção 1.

A saída deve ser algo assim:

```
Game ID: 11348965
┌─────────┬─────────┬───────┬────────┬─────────────────┬────────────┬────────────────┐
│ (index) │  name   │ frags │ deaths │ preferredWeapon │ killStreak │     awards     │
├─────────┼─────────┼───────┼────────┼─────────────────┼────────────┼────────────────┤
│    0    │ 'Roman' │   1   │   0    │      'M16'      │     1      │ [ 'immortal' ] │
│    1    │ 'Nick'  │   0   │   2    │       ''        │     0      │       []       │
└─────────┴─────────┴───────┴────────┴─────────────────┴────────────┴────────────────┘
```

#### Opção 3

A opção 3 é muito semelhante a opção 2, com a diferença que é exibido apenas um único ranking global utilizando os dados de todas as partidas.

### Testes

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

### Próximos Passos

As seguintes melhorias podem ser feitas no projeto:

* Implementar prêmio para jogador que matar 5 vezes em menos de 1 minuto

* Adicionar testes de e2e

* Melhorar testes unitários para garantir 100% de cobertura das services

* A ranking service possui muitas responsabilidades. Acredito que isso poderia ser melhorado criando outras services com responsabilidades menores.

* Melhorar o tratamento de erros
  * Atualmente somente erros de leitura de arquivo são tratados. Isso pode ser melhorado para deixar o projeto mais resiliente.

* Melhorar observabilidade
  * Seria interessante adicionar logs nas services para facilitar a identificação de possíveis problemas que podem ocorrer.

* Melhorar obtenção das informações das partidas na ranking service
  * Atualmente a ranking service obtém a informação de todas as partidas que estão armazenadas no repositório. Seria interessante adicionar algum tipo de filtro por data ou id da partida, para evitar sobrecarregar o repositório ou a memória da aplicação em cenários com muitas partidas armazenadas.

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
