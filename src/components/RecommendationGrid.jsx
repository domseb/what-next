import RecommendationCard from './RecommendationCard'

const GhostCard = () => (
  <div className="recommendation-card ghost-card">
    <div className="card-image" style={{ background: '#23244a', height: 200, position: 'relative' }}>
      <div className="ghost-shimmer" />
    </div>
    <div className="card-content">
      <div className="ghost-title ghost-block" />
      <div className="ghost-type ghost-block" />
      <div className="ghost-year ghost-block" />
    </div>
  </div>
)

const RecommendationGrid = ({ recommendations, getSourceInfo, loading }) => {
  if (loading || recommendations.length === 0) {
    // Show 3 ghost cards
    return (
      <div className="recommendations-grid">
        <GhostCard />
        <GhostCard />
        <GhostCard />
      </div>
    )
  }
  return (
    <div className="recommendations-grid">
      {recommendations.map((item, index) => (
        <RecommendationCard key={item.id || index} item={item} getSourceInfo={getSourceInfo} />
      ))}
    </div>
  )
}

export default RecommendationGrid 