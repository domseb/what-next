const RecommendationCard = ({ item, getSourceInfo }) => (
  <div className="recommendation-card">
    <div className="card-image" style={{ position: 'relative' }}>
      {item.image_url ? (
        <img src={item.image_url} alt={item.title} />
      ) : (
        <div className="placeholder-image">
          <span>🎬</span>
        </div>
      )}
      <div className="card-providers">
        {item.auSources && item.auSources.length > 0 ? (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {item.auSources.map(src => {
              const info = getSourceInfo(src.source_id)
              return info ? (
                <img key={src.source_id} src={info.logo_100px} alt={info.name} title={info.name} style={{ height: 28, width: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)' }} />
              ) : (
                <span key={src.source_id}>{src.name}</span>
              )
            })}
          </div>
        ) : (
          <span style={{ fontSize: '0.9rem', color: '#b91c1c' }}>Not available for streaming in AU</span>
        )}
      </div>
      <div className="rating">
        {typeof item.criticScore === 'number' && (
          <p>{item.criticScore}%</p>
        )}
      </div>
    </div>
    <div className="card-content">
      <h3>{item.title}</h3>
      <p>{item.type === 'movie' ? 'Movie' : 'TV Series'}</p>
      {/* Streaming providers for AU */}
    </div>
  </div>
)

export default RecommendationCard 