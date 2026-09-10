export default function ChannelSelector({ channels, activeChannel, onChannelChange }) {
  const handleShuffle = () => {
    const others = channels.filter(c => c.id !== activeChannel?.id);
    const random = others[Math.floor(Math.random() * others.length)];
    if (random) onChannelChange(random);
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

        {/* Text-only channel buttons — no emojis */}
        {channels.map((channel) => {
          const isActive = activeChannel?.id === channel.id;
          return (
            <button
              key={channel.id}
              id={`channel-btn-${channel.name.toLowerCase()}`}
              className={`channel-btn ${isActive ? 'active' : ''}`}
              onClick={() => onChannelChange(channel)}
              role="tab"
              aria-selected={isActive}
              aria-label={`Canal ${channel.label}`}
            >
              {channel.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
