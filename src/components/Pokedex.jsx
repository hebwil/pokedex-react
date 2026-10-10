import React, { useEffect, useState } from 'react';
import PokemonCard, { Icon, PokemonDetails, TYPE_NAMES } from './PokemonCard.jsx';

const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=20';
const responseCache = new Map();
async function fetchJson(url, signal) {
  if (responseCache.has(url)) return responseCache.get(url);
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Erro HTTP ' + response.status);
  const data = await response.json();
  responseCache.set(url, data);
  return data;
}
function readFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem('will-pokedex-favorites') || '[]');
    return Array.isArray(stored) ? stored.filter(Number.isInteger) : [];
  } catch { return []; }
}

export default function Pokedex() {
  const [pokemons, setPokemons] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sort, setSort] = useState('number');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState(readFavorites);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  // useEffect inicia a consulta; useState guarda os dados, filtros e estados da tela.
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    let active = true;
    async function loadPokemons() {
      setLoading(true);
      setError('');
      try {
        const list = await fetchJson(API_URL, controller.signal);
        const details = await Promise.all(list.results.map(({ url }) => fetchJson(url, controller.signal)));
        if (active) setPokemons(details);
      } catch {
        if (active) setError('Não foi possível carregar os Pokémon. Confira sua conexão e tente novamente.');
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

  useEffect(() => {
    try { localStorage.setItem('will-pokedex-favorites', JSON.stringify(favorites)); } catch { /* Favoritos continuam disponíveis nesta sessão. */ }
  }, [favorites]);

  const query = search.trim().toLowerCase().replace(/^#/, '');
  const matchesSearch = pokemon => pokemon.name.includes(query) || (query !== '' && /^\d+$/.test(query) && pokemon.id === Number(query));
  const baseResults = pokemons.filter(pokemon => matchesSearch(pokemon) && (!onlyFavorites || favorites.includes(pokemon.id)));
  const availableTypes = [...new Set(pokemons.flatMap(p => p.types.map(t => t.type.name)))].sort((a, b) => TYPE_NAMES[a].localeCompare(TYPE_NAMES[b], 'pt-BR'));
  const filteredPokemons = baseResults.filter(p => selectedType === 'all' || p.types.some(({ type }) => type.name === selectedType))
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'reverse' ? b.id - a.id : a.id - b.id);
  const activeFilters = Boolean(search || selectedType !== 'all' || onlyFavorites || sort !== 'number');
  const featured = pokemons.find(p => p.id === 6);

  function clearFilters() { setSearch(''); setSelectedType('all'); setOnlyFavorites(false); setSort('number'); }
  function toggleFavorite(id) { setFavorites(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]); }

  return (
    <>
      <a className="skip-link" href="#collection">Pular para a coleção</a>
      <header className="site-header">
        <a href="#" className="brand" aria-label="Will Pokédex, início"><span className="will-mark" aria-hidden="true">W<span>.</span></span><span className="brand-word">WILL<span>POKÉDEX</span></span></a>
        <nav aria-label="Navegação principal"><a href="#collection">Explorar coleção</a><a href="https://github.com/hebwil/pokedex-react" target="_blank" rel="noreferrer" className="github-link">Ver projeto<Icon name="external" /></a></nav>
      </header>
      <main>
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> WILL'S COLLECTION <span className="eyebrow-divider">/</span> VOL. 01</p>
            <h1 id="page-title">Um universo.<br />Vinte primeiras<br /><span>descobertas.</span></h1>
            <p className="hero-description">A curiosidade é o primeiro passo. Explore Kanto,<br className="desktop-break" /> conheça cada Pokémon e monte sua própria seleção.</p>
            <a className="primary-button" href="#collection">Explorar a Pokédex<Icon name="arrow" /></a>
            <div className="hero-meta"><span><strong>20</strong> Pokémon</span><span><strong>Kanto</strong> Região</span><span><strong>Sua</strong> Coleção</span></div>
          </div>
          <div className="hero-feature">
            <div className="feature-top"><span><span className="status-dot" /> EM DESTAQUE</span><span>006 / 020</span></div>
            <span className="feature-grid" aria-hidden="true" />
            <span className="feature-orbit" aria-hidden="true" /><span className="feature-orbit second" aria-hidden="true" />
            <span className="feature-number" aria-hidden="true">006</span>
            <img className="featured-image" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" alt="Charizard" width="475" height="475" onError={event => { if (!event.currentTarget.dataset.fallback) { event.currentTarget.dataset.fallback = 'true'; event.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png'; } }} />
            <div className="feature-bottom"><div><span className="feature-label">O PRIMEIRO VOO É SÓ O COMEÇO</span><h2>Charizard<span>.</span></h2><span className="feature-types">FOGO <span>/</span> VOADOR</span></div><button className="feature-open" disabled={!featured} onClick={() => setSelectedPokemon(featured)} aria-label="Ver detalhes de Charizard em destaque"><Icon name="external" /></button></div>
          </div>
        </section>
        <section id="collection" className="collection" aria-labelledby="collection-title" aria-busy={loading}>
          <div className="collection-heading"><div><p className="eyebrow">01 <span className="eyebrow-divider">/</span> EXPLORE DO SEU JEITO</p><h2 id="collection-title">Sua coleção começa aqui<span>.</span></h2></div><span className="collection-tag"><span className="status-dot" /> KANTO · #001—#020</span></div>
          <div className="collection-toolbar">
            <div className="view-tabs" role="group" aria-label="Visualização da coleção"><button aria-pressed={!onlyFavorites} onClick={() => setOnlyFavorites(false)}><Icon name="grid" />Todos<span>{pokemons.length}</span></button><button aria-pressed={onlyFavorites} onClick={() => setOnlyFavorites(true)}><Icon name="heart" />Favoritos<span>{pokemons.filter(p => favorites.includes(p.id)).length}</span></button></div>
            <span className="collection-tip">Clique em um Pokémon para abrir sua ficha<Icon name="external" /></span>
          </div>
          <div className="filter-panel">
            <div className="filter-top">
              <div className="search-field"><Icon name="search" /><label className="sr-only" htmlFor="search">Buscar Pokémon por nome ou número</label><input id="search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Busque por nome ou número. Ex.: Charizard, 006" autoComplete="off" />{search && <button className="search-clear" aria-label="Limpar busca" onClick={() => setSearch('')}><Icon name="close" /></button>}</div>
              <label className="sort-field" htmlFor="sort"><span>Ordenar por</span><select id="sort" value={sort} onChange={event => setSort(event.target.value)}><option value="number">Número ↑</option><option value="reverse">Número ↓</option><option value="name">Nome A–Z</option></select></label>
            </div>
            <div className="type-filters" role="group" aria-label="Filtrar por tipo"><span className="filter-label">TIPOS</span><button className="type-chip all-types" aria-pressed={selectedType === 'all'} onClick={() => setSelectedType('all')}>Todos<span>{baseResults.length}</span></button>{availableTypes.map(type => <button key={type} className={'type-chip type-' + type} aria-pressed={selectedType === type} onClick={() => setSelectedType(selectedType === type ? 'all' : type)}><span className="type-dot" />{TYPE_NAMES[type]}<span className="type-chip-count">{baseResults.filter(p => p.types.some(item => item.type.name === type)).length}</span></button>)}</div>
          </div>
          {loading ? <><p className="result-count" role="status"><span className="status-dot" /> Preparando suas primeiras descobertas…</p><div className="pokemon-grid" aria-hidden="true">{Array.from({length:8}, (_, index) => <div className="skeleton" key={index}><div /><span /><span /></div>)}</div></> : error ? <div className="empty-state" role="alert"><span className="empty-symbol">!</span><h3>Uma pausa na aventura.</h3><p>{error}</p><button className="primary-button" onClick={() => setAttempt(value => value + 1)}>Tentar novamente<Icon name="arrow" /></button></div> : <>
            <div className="results-bar"><p className="result-count" role="status"><strong>{filteredPokemons.length}</strong> de {pokemons.length} Pokémon{selectedType !== 'all' && <span className={'active-filter type-' + selectedType}>{TYPE_NAMES[selectedType]}</span>}{onlyFavorites && <span className="active-filter">Favoritos</span>}</p><button className="reset-filters" disabled={!activeFilters} onClick={clearFilters}>Limpar filtros<Icon name="close" /></button></div>
            {filteredPokemons.length ? <div className="pokemon-grid">{filteredPokemons.map(pokemon => <PokemonCard key={pokemon.id} pokemon={pokemon} favorite={favorites.includes(pokemon.id)} onOpen={setSelectedPokemon} onFavorite={toggleFavorite} />)}</div> : <div className="empty-state"><span className="empty-symbol"><Icon name={onlyFavorites ? 'heart' : 'search'} /></span><h3>{onlyFavorites && !favorites.length ? 'Sua seleção, seu estilo.' : 'Nenhuma descoberta por aqui.'}</h3><p>{onlyFavorites && !favorites.length ? 'Toque no coração de um card para salvar seus Pokémon favoritos.' : 'Tente outro nome, número ou tipo. Esta coleção reúne os primeiros 20 Pokémon.'}</p><button className="primary-button" onClick={clearFilters}>Ver todos os Pokémon<Icon name="arrow" /></button></div>}
          </>}
          <div className="collection-note"><span>20 primeiras descobertas. Infinitas possibilidades.</span><span>REGIÃO DE KANTO / VOL. 01</span></div>
        </section>
      </main>
      <footer><a className="creator-signature" href="https://github.com/hebwil" target="_blank" rel="noreferrer"><span className="signature-mark">W.</span><span>Created by <strong>Will</strong><span className="signature-caption">CURIOSIDADE EM CADA DETALHE.</span></span><Icon name="external" /></a><p>Projeto educacional · Dados e imagens: <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI<Icon name="external" /></a></p><a className="back-top" href="#" aria-label="Voltar ao início">Voltar ao topo ↑</a></footer>
      {selectedPokemon && <PokemonDetails key={selectedPokemon.id} pokemon={selectedPokemon} favorite={favorites.includes(selectedPokemon.id)} onClose={() => setSelectedPokemon(null)} onFavorite={toggleFavorite} />}
    </>
  );
}
