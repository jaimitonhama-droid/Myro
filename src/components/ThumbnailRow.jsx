// Extra thumbnail images per channel to simulate a content strip
// In a real scenario these would come from an API
const channelThumbnails = {
  1: [ // Animes
    { id: 'a1', title: 'Dragon Ball Super', img: 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=75' },
    { id: 'a2', title: 'Naruto Shippuden',  img: 'https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400&q=75' },
    { id: 'a3', title: 'One Piece',          img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=75' },
    { id: 'a4', title: 'Attack on Titan',    img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=75' },
    { id: 'a5', title: 'Demon Slayer',       img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=75' },
    { id: 'a6', title: 'My Hero Academia',   img: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&q=75' },
  ],
  2: [ // Filmes
    { id: 'f1', title: 'Ação Extrema',   img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=75' },
    { id: 'f2', title: 'Suspense Total', img: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=75' },
    { id: 'f3', title: 'Aventura',       img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=75' },
    { id: 'f4', title: 'Romance',        img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=75' },
    { id: 'f5', title: 'Ficção',         img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=75' },
    { id: 'f6', title: 'Comédia',        img: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&q=75' },
  ],
  3: [ // Músicas
    { id: 'm1', title: 'Kizomba Mix',      img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=75' },
    { id: 'm2', title: 'Afro House',       img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=75' },
    { id: 'm3', title: 'Funk Brasil',      img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=75' },
    { id: 'm4', title: 'Sertanejo',        img: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=75' },
    { id: 'm5', title: 'Top Moçambique',   img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=75' },
    { id: 'm6', title: 'Hits Internacionais', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=75' },
  ],
  4: [ // Infantil
    { id: 'i1', title: 'Patrulha Canina',  img: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&q=75' },
    { id: 'i2', title: 'PJ Masks',         img: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=75' },
    { id: 'i3', title: 'Peppa Pig',        img: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400&q=75' },
    { id: 'i4', title: 'Ben 10',           img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75' },
    { id: 'i5', title: 'Toy Story',        img: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&q=75' },
    { id: 'i6', title: 'Frozen',           img: 'https://images.unsplash.com/photo-1545830428-71ebac7b98d1?w=400&q=75' },
  ],
};

export default function ThumbnailRow({ channels, activeChannel, onChannelChange }) {
  const items = channelThumbnails[activeChannel?.id] || [];
  const label = `A Passar em ${activeChannel?.label || ''}`;

  return (
    <section className="thumbnails-section" aria-label="Conteúdos em destaque">
      <h2 className="thumbnails-label">{label}</h2>
      <div className="thumbnails-row">
        {items.map((item) => (
          <div
            key={item.id}
            className="thumbnail-card"
            role="button"
            aria-label={`Ver ${item.title}`}
            id={`thumb-${item.id}`}
            onClick={() => onChannelChange(activeChannel)}
            title={item.title}
          >
            <img src={item.img} alt={item.title} loading="lazy" />
            <span className="thumbnail-live">AO VIVO</span>
            <div className="thumbnail-overlay">
              <div className="thumbnail-play">▶</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
