import React, { useEffect, useRef, useState } from 'react';

export const TYPE_NAMES = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', grass: 'Grama',
  electric: 'Elétrico', ice: 'Gelo', fighting: 'Lutador', poison: 'Veneno',
  ground: 'Terra', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
  rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio',
  steel: 'Aço', fairy: 'Fada',
};

export function Icon({ name, ...props }) {
  const paths = {
    arrow: <><path d="M5 12h14M12 5l7 7-7 7" /></>,
    external: <><path d="M7 17 17 7M7 7h10v10" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.arrow}</svg>;
}

export function PokemonImage({ pokemon, ...props }) {
  const official = pokemon.sprites.other?.['official-artwork']?.front_default;
  const sprite = pokemon.sprites.front_default;
  const [source, setSource] = useState(official || sprite);
  useEffect(() => setSource(official || sprite), [official, sprite]);
  return source ? <img {...props} src={source} alt={pokemon.name} onError={() => setSource(source === official && sprite !== official ? sprite : null)} />
    : <span className="image-placeholder">Imagem indisponível</span>;
}

export function TypeBadges({ pokemon }) {
  return <span className="type-list">{pokemon.types.map(({ type }) => <span key={type.name} className={'type-badge type-' + type.name}><span className="type-dot" />{TYPE_NAMES[type.name] || type.name}</span>)}</span>;
}

// Componente reutilizável: os dados e ações chegam ao card via props.
export default function PokemonCard({ pokemon, favorite, onOpen, onFavorite }) {
  const type = pokemon.types[0].type.name;
  return (
    <article className={'pokemon-card theme-' + type}>
      <button className="favorite-button" onClick={() => onFavorite(pokemon.id)} aria-pressed={favorite} aria-label={(favorite ? 'Remover ' : 'Adicionar ') + pokemon.name + (favorite ? ' dos favoritos' : ' aos favoritos')}>
        <Icon name="heart" />
      </button>
      <button className="card-open" onClick={() => onOpen(pokemon)} aria-label={'Ver detalhes de ' + pokemon.name}>
        <span className="card-art">
          <span className="pokemon-number">#{String(pokemon.id).padStart(3, '0')}</span>
          <span className="art-orbit" />
          <span className="art-watermark" aria-hidden="true">{String(pokemon.id).padStart(3, '0')}</span>
          <PokemonImage pokemon={pokemon} width="240" height="240" loading="lazy" />
        </span>
        <span className="card-info">
          <span className="card-heading"><span className="card-name">{pokemon.name}</span><Icon name="external" /></span>
          <TypeBadges pokemon={pokemon} />
          <span className="card-bottom"><span>Ver ficha completa</span><span className="card-measure">{(pokemon.height / 10).toLocaleString('pt-BR')} m</span></span>
        </span>
      </button>
    </article>
  );
}

const STAT_NAMES = { hp: 'Vida', attack: 'Ataque', defense: 'Defesa', 'special-attack': 'Ataque especial', 'special-defense': 'Defesa especial', speed: 'Velocidade' };

export function PokemonDetails({ pokemon, favorite, onClose, onFavorite }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!element.open) element.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      // O diálogo é removido pelo React ao fechar; evita disparar close durante StrictMode.
    };
  }, []);
  const total = pokemon.stats.reduce((sum, item) => sum + item.base_stat, 0);
  return (
    <dialog ref={dialog} className={'pokemon-dialog theme-' + pokemon.types[0].type.name} aria-labelledby="detail-title" onClose={event => { if (!event.currentTarget.open) onClose(); }} onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <div className="detail-layout">
        <button className="detail-close" autoFocus onClick={() => dialog.current.close()} aria-label="Fechar detalhes"><Icon name="close" /></button>
        <div className="detail-art">
          <div className="detail-eyebrow"><span className="status-dot" /> FICHA DO POKÉMON <span>#{String(pokemon.id).padStart(3, '0')}</span></div>
          <span className="detail-watermark" aria-hidden="true">{String(pokemon.id).padStart(3, '0')}</span>
          <PokemonImage pokemon={pokemon} width="380" height="380" />
          <div className="detail-name"><p>REGIÃO DE KANTO</p><h2 id="detail-title">{pokemon.name}</h2><TypeBadges pokemon={pokemon} /></div>
        </div>
        <div className="detail-data">
          <div className="detail-intro"><span className="eyebrow">POR DENTRO DA DESCOBERTA</span><h3>Mais que um nome.</h3></div>
          <div className="measure-grid"><div><span>Altura</span><strong>{(pokemon.height / 10).toLocaleString('pt-BR')} <small>m</small></strong></div><div><span>Peso</span><strong>{(pokemon.weight / 10).toLocaleString('pt-BR')} <small>kg</small></strong></div></div>
          <div className="stats-heading"><h4>Atributos base</h4><span>TOTAL <strong>{total}</strong></span></div>
          <div className="stats-list">{pokemon.stats.map(({ stat, base_stat }) => <div key={stat.name} className="stat-row"><span>{STAT_NAMES[stat.name] || stat.name}</span><strong>{base_stat}</strong><span className="stat-track"><span style={{ width: (base_stat / 255 * 100) + '%' }} /></span></div>)}</div>
          <div className="abilities"><h4>Habilidades</h4><div>{pokemon.abilities.map(({ ability, is_hidden }) => <span key={ability.name}>{ability.name.replaceAll('-', ' ')}{is_hidden && <small>Oculta</small>}</span>)}</div></div>
          <button className={'detail-favorite' + (favorite ? ' is-favorite' : '')} onClick={() => onFavorite(pokemon.id)} aria-pressed={favorite}><Icon name="heart" />{favorite ? 'Salvo nos seus favoritos' : 'Adicionar aos favoritos'}</button>
          <span className="detail-credit">Informações fornecidas pela PokéAPI.</span>
        </div>
      </div>
    </dialog>
  );
}
