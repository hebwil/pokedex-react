# Pokédex em React

Atividade prática de React: uma Pokédex responsiva que consulta a API pública [PokéAPI](https://pokeapi.co/docs/v2), exibe os 20 primeiros Pokémon e permite filtrar por nome e tipo.

**Repositório:** https://github.com/hebwil/pokedex-react

## Executar localmente

Pré-requisito: Node.js 22.12 ou superior e npm.

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite no terminal (normalmente `http://127.0.0.1:5173`). É necessário acesso à internet para consultar a API e carregar imagens e fontes. Caso a fonte externa falhe, a aplicação utiliza uma fonte do sistema.

Para gerar e conferir a versão de produção:

```bash
npm run build
npm run preview
```

Também é possível usar pnpm: `pnpm install --frozen-lockfile`, `pnpm dev` e `pnpm build`. O arquivo `pnpm-lock.yaml` registra as versões usadas na validação do projeto.

## Requisitos implementados

| Conceito | Implementação |
| --- | --- |
| Componentes | `Pokedex` controla a aplicação; `PokemonCard` é reutilizado para cada Pokémon. |
| Props | `Pokedex` passa o objeto `pokemon` para cada `PokemonCard`. |
| `useState` | Armazena lista, busca, tipo selecionado, carregamento, erro e tentativa de recarregar. |
| `useEffect` | Busca os Pokémon ao montar o componente; cancela requisições ao desmontar. |
| `fetch` | Consulta a listagem e depois os detalhes de cada Pokémon. |
| Exibição | Nome, imagem oficial (ou sprite disponível), número e tipos em português. |
| Busca | Filtra em tempo real pelo nome, ignorando maiúsculas e espaços nas extremidades. |
| Carregamento | Mostra cartões temporários e mensagem durante a consulta. |

Extras: filtro por tipo, estado sem resultados, botão para limpar filtros, tratamento de falhas HTTP e de conexão, timeout de 20 segundos, nova tentativa, cache em memória durante a sessão, imagem alternativa em caso de falha, navegação por teclado e layout para celular.

## Como os dados chegam à tela

1. `useEffect` chama `fetch` para `https://pokeapi.co/api/v2/pokemon?limit=20`.
2. A resposta fornece `results`, uma lista de nomes e URLs.
3. `Promise.all` busca os detalhes nas URLs, como `https://pokeapi.co/api/v2/pokemon/1/`.
4. `setPokemons` salva os detalhes no estado e o React atualiza a tela.
5. `filter` aplica a busca e o tipo selecionado sem novas requisições.
6. `map` renderiza um `PokemonCard` para cada resultado, com `key={pokemon.id}`.

A busca se limita aos 20 Pokémon carregados, como proposto na atividade. Por exemplo, Pikachu não faz parte dessa lista inicial.

## Estrutura

```text
public/pokeball.svg          Ícone da aplicação
src/main.jsx                Inicialização do React
src/components/Pokedex.jsx  Estado, API, busca e listagem
src/components/PokemonCard.jsx  Card e tradução dos tipos
src/styles.css              Estilos e responsividade
index.html                  Documento HTML
vite.config.js              Configuração do Vite
```

## Roteiro de verificação

- Ao abrir, aguardar o carregamento e conferir 20 cards, de Bulbasaur a Raticate.
- Buscar `CHAR` e conferir Charmander, Charmeleon e Charizard.
- Selecionar Água e conferir Squirtle, Wartortle e Blastoise.
- Combinar nome e tipo, limpar filtros e conferir os 20 cards novamente.
- Buscar um nome inexistente e conferir a mensagem sem resultados.
- Bloquear a API no navegador, recarregar e conferir o erro; liberar a API e clicar em “Tentar novamente”.
- Conferir a navegação com Tab e o layout em uma tela estreita.

## Validação realizada

- Build de produção concluído com Vite.
- Integração real com a API: 20 Pokémon carregados.
- Busca ` CHAR `: Charmander, Charmeleon e Charizard.
- Filtro Água: Squirtle, Wartortle e Blastoise.
- Filtros combinados sem resultados e limpeza dos filtros verificados.
- Falha da API simulada no navegador e recuperação pelo botão “Tentar novamente” verificadas.
- Layout a 390 px: duas colunas, sem transbordamento horizontal.

## Créditos

Dados e imagens de Pokémon fornecidos pela [PokéAPI](https://pokeapi.co/). Pokémon e seus personagens pertencem aos respectivos titulares. Projeto desenvolvido para fins educacionais.
