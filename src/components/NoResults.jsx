const NoResults = () => (
  <div className="no-recommendations">
    <p>🎬 No results found! Try relaxing your filters, lowering the critic score threshold, or spinning again.</p>
    <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.7 }}>
      Tip: You can leave filters empty to get random recommendations from all available content.
    </p>
  </div>
)

export default NoResults 