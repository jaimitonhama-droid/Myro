export default function ChannelSelector({ categories, activeCategory, onCategoryChange }) {
  const handleShuffle = () => {
    const others = categories.filter(c => c !== activeCategory);
    const random = others[Math.floor(Math.random() * others.length)];
    if (random) onCategoryChange(random);
  };

  return (
    <section className="channels-section" id="canais" aria-label="Seleção de canais">
      <p className="channels-label">
        Assistir <span>Agora</span>
      </p>

      <div className="channels-row" role="tablist" aria-label="Canais disponíveis">
        {/* Shuffle */}
        <button
          id="channel-btn-shuffle"
          className="channel-btn-shuffle"
          onClick={handleShuffle}
          aria-label="Canal aleatório"
          title="Canal aleatório"
        >
          ⇄
        </button>

        {/* Text-only category buttons */}
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              id={`cat-btn-${cat.toLowerCase()}`}
              className={`channel-btn ${isActive ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat)}
              role="tab"
              aria-selected={isActive}
              aria-label={`Categoria ${cat}`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </section>
  );
}
