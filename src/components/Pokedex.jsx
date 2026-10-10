import React, { useEffect, useState } from 'react';
import PokemonCard, { TYPE_NAMES } from './PokemonCard.jsx';

const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=20';

// Evita repetir requisições já concluídas durante esta sessão da aplicação.
const responseCache = new Map();
async function fetchJson(url, signal) {
  if (responseCache.has(url)) return responseCache.get(url);
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
  const data = await response.json();
  responseCache.set(url, data);
  return data;
}

export default function Pokedex() {
  const [pokemons, setPokemons] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  // Executa ao montar a página e quando o usuário solicita uma nova tentativa.
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort('timeout'), 20000);
    let active = true;

    async function loadPokemons() {
      setLoading(true);
      setError('');
      try {
        const list = await fetchJson(API_URL, controller.signal);
        // A listagem contém nome e URL; cada URL fornece imagem e tipos.
        const details = await Promise.all(
          list.results.map(({ url }) => fetchJson(url, controller.signal)),
        );
        if (active) setPokemons(details);
      } catch {
        if (active) {
          setError('Não foi possível carregar os Pokémon. Confira sua conexão e tente novamente.');
        }
      } finally {
        window.clearTimeout(timeout);
        if (active) setLoading(false);
      }
    }

    loadPokemons();
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  const availableTypes = [...new Set(pokemons.flatMap(p => p.types.map(t => t.type.name)))];
  const filteredPokemons = pokemons.filter(pokemon =>
    pokemon.name.includes(search.trim().toLowerCase()) &&
    (selectedType === 'all' || pokemon.types.some(({ type }) => type.name === selectedType)),
  );

  function clearFilters() {
    setSearch('');
    setSelectedType('all');
  }

  return (
    <>
      <a className="skip-link" href="#collection">Pular para os Pokémon</a>
      <header className="site-header">
        <a href="#" className="brand" aria-label="Pokédex, início">
          <img src="./pokeball.svg" alt="" width="30" height="30" />
          <span>pokédex<span className="brand-dot">.</span></span>
        </a>
        <span className="header-label">UM UNIVERSO PARA DESCOBRIR</span>
        <a className="api-link" href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI <span aria-hidden="true">↗</span></a>
      </header>

      <main>
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <div className="eyebrow"><span /> GUIA DE CAMPO · REGIÃO DE KANTO</div>
            <h1 id="page-title">Pequenos encontros.<br /><span>Grandes descobertas.</span></h1>
            <p>Todo grande treinador começa com uma descoberta.<br className="desktop-break" /> Conheça os Pokémon e encontre o seu favorito.</p>
            <a className="explore-link" href="#collection">Explore a coleção <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-illustration" aria-hidden="true">
            <span className="orbit orbit-one" /><span className="orbit orbit-two" />
            <span className="star star-one">✦</span><span className="star star-two">✦</span>
            <div className="hero-ball"><div className="ball-band" /><div className="ball-button" /></div>
            <span className="ball-shadow" />
            <span className="hero-caption">A AVENTURA COMEÇA AQUI</span>
          </div>
        </section>

        <section id="collection" className="collection" aria-labelledby="collection-title" aria-busy={loading}>
          <div className="collection-heading">
            <div><div className="eyebrow muted">CONHEÇA CADA UM DELES</div><h2 id="collection-title">Sua próxima descoberta<span>.</span></h2></div>
            <span className="collection-count">Primeiros <strong>20</strong> Pokémon</span>
          </div>
          <div className="filters">
            <div className="search-field">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
              <label className="sr-only" htmlFor="search">Buscar Pokémon pelo nome</label>
              <input id="search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Qual Pokémon você está procurando?" autoComplete="off" />
            </div>
            <label className="type-filter" htmlFor="type">Tipo
              <select id="type" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                <option value="all">Todos os tipos</option>
                {availableTypes.map(type => <option key={type} value={type}>{TYPE_NAMES[type] || type}</option>)}
              </select>
            </label>
          </div>

          {loading ? (
            <><p role="status" className="result-count">Preparando sua Pokédex…</p><div className="pokemon-grid" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <div className="skeleton" key={index}><div /><span /><span /></div>)}</div></>
          ) : error ? (
            <div className="empty-state" role="alert"><span className="state-symbol" aria-hidden="true">!</span><h3>Uma pausa na aventura</h3><p>{error}</p><button onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button></div>
          ) : (
            <>
              <p className="result-count" role="status">Exibindo <strong>{filteredPokemons.length}</strong> de {pokemons.length} Pokémon{search || selectedType !== 'all' ? <button className="clear-button" onClick={clearFilters}>Limpar filtros</button> : null}</p>
              {filteredPokemons.length > 0 ? (
                <div className="pokemon-grid">{filteredPokemons.map(pokemon => <PokemonCard key={pokemon.id} pokemon={pokemon} />)}</div>
              ) : (
                <div className="empty-state"><span className="state-symbol" aria-hidden="true">?</span><h3>Nenhum Pokémon por aqui</h3><p>Busque outro nome ou tipo entre os primeiros 20 Pokémon.</p><button onClick={clearFilters}>Ver todos os Pokémon</button></div>
              )}
            </>
          )}
        </section>
      </main>
      <footer><span>Created by Will.</span><span>Dados e imagens: <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI ↗</a></span></footer>
    </>
  );
}
