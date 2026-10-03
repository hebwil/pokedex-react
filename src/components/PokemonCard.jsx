import React, { useState } from 'react';

export const TYPE_NAMES = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', grass: 'Grama',
  electric: 'Elétrico', ice: 'Gelo', fighting: 'Lutador', poison: 'Veneno',
  ground: 'Terra', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
  rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio',
  steel: 'Aço', fairy: 'Fada',
};

// O componente filho recebe os dados do componente Pokedex via props.
export default function PokemonCard({ pokemon }) {
  const [imageFailed, setImageFailed] = useState(false);
  const primaryType = pokemon.types[0].type.name;
  const image = pokemon.sprites.other?.['official-artwork']?.front_default
    || pokemon.sprites.front_default;

  return (
    <article className={`pokemon-card theme-${primaryType}`}>
      <div className="card-art">
        <span className="pokemon-number">#{String(pokemon.id).padStart(3, '0')}</span>
        <div className="art-circle" aria-hidden="true" />
        {image && !imageFailed ? (
          <img src={image} alt={pokemon.name} width="200" height="200"
            loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <span className="image-placeholder">Imagem indisponível</span>
        )}
      </div>
      <div className="card-info">
        <h3>{pokemon.name}</h3>
        <ul className="type-list" aria-label="Tipos">
          {pokemon.types.map(({ type }) => (
            <li key={type.name} className={`type-badge type-${type.name}`}>
              <span aria-hidden="true" className="type-dot" />
              {TYPE_NAMES[type.name] || type.name}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
