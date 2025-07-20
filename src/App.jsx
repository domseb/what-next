import { useState, useEffect, useRef } from 'react'
import Select from 'react-select'
import axios from 'axios'
import './App.css'

function App() {
  const [selectedProviders, setSelectedProviders] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState([])
  const [genres, setGenres] = useState([])
  const [allSources, setAllSources] = useState([])
  const [shownIds, setShownIds] = useState([])

  // Australian streaming providers (using actual Watchmode IDs)
  const australianProviders = [
    { value: 203, label: 'Netflix' },
    { value: 26, label: 'Prime Video' },
    { value: 371, label: 'AppleTV+' },
    { value: 372, label: 'Disney+' },
    { value: 425, label: 'Stan' },
    { value: 423, label: 'BINGE' },
    { value: 424, label: 'Foxtel Now' },
    { value: 444, label: 'Paramount+' },
    { value: 376, label: 'Britbox' },
    { value: 17, label: 'Acorn TV' },
    { value: 252, label: 'Shudder' },
    { value: 392, label: 'Hayu' },
    { value: 80, label: 'Crunchyroll Premium' },
    { value: 79, label: 'Crunchyroll' },
    { value: 367, label: 'Kanopy' },
    { value: 437, label: 'Beamafilm' },
    { value: 421, label: 'Curiosity Stream' },
    { value: 181, label: 'MUBI' },
    { value: 296, label: 'Tubi TV' },
    { value: 427, label: '7plus' },
    { value: 426, label: '9Now' },
    { value: 428, label: 'ABC iview' },
    { value: 429, label: 'SBS On Demand' },
    { value: 430, label: 'tenplay' }
  ]

  const contentTypes = [
    { value: 'movie', label: 'Movie' },
    { value: 'tv_series', label: 'TV Series' }
  ]

  // Fetch all sources (for logo lookup)
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await axios.get('https://api.watchmode.com/v1/sources', {
          params: { apiKey: '4PSbldWKiYnq4HwWBM7DdVe0UAfbJjLBAgNyAgDN' }
        })
        setAllSources(response.data)
      } catch (e) {
        setAllSources([])
      }
    }
    fetchSources()
  }, [])

  // Fetch genres from Watchmode API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get('https://api.watchmode.com/v1/genres', {
          params: {
            apiKey: '4PSbldWKiYnq4HwWBM7DdVe0UAfbJjLBAgNyAgDN'
          }
        })
        const genreOptions = response.data.map(genre => ({
          value: genre.id,
          label: genre.name
        }))
        setGenres(genreOptions)
      } catch (error) {
        setGenres([
          { value: 1, label: 'Action' },
          { value: 2, label: 'Adventure' },
          { value: 3, label: 'Animation' },
          { value: 4, label: 'Comedy' },
          { value: 5, label: 'Crime' },
          { value: 6, label: 'Documentary' },
          { value: 7, label: 'Drama' },
          { value: 8, label: 'Family' },
          { value: 9, label: 'Fantasy' },
          { value: 10, label: 'Horror' },
          { value: 11, label: 'Mystery' },
          { value: 12, label: 'Romance' },
          { value: 13, label: 'Sci-Fi' },
          { value: 14, label: 'Thriller' },
          { value: 15, label: 'War' }
        ])
      }
    }
    fetchGenres()
  }, [])

  // Helper to get source info by id
  const getSourceInfo = (id) => allSources.find(s => s.id === id)

  const handleRoulette = async () => {
    setLoading(true)
    try {
      const totalPages = 10 // up to 10 pages (500 results max)
      let allTitles = []
      let found = []
      let page = 1
      const selectedProviderIds = selectedProviders.map(p => p.value)
      // Track new IDs for this spin
      let newShownIds = [...shownIds]
      let exhausted = false
      while (found.length < 3 && page <= totalPages) {
        const params = {
          apiKey: '4PSbldWKiYnq4HwWBM7DdVe0UAfbJjLBAgNyAgDN',
          limit: 50,
          sort_by: 'relevance_desc',
          regions: 'AU',
          page
        }
        if (selectedTypes.length > 0) {
          params.types = selectedTypes.map(type => type.value).join(',')
        }
        if (selectedGenres.length > 0) {
          params.genres = selectedGenres.map(genre => genre.value).join(',')
        }
        if (selectedProviders.length > 0) {
          params.sources = selectedProviders.map(provider => provider.value).join(',')
        }
        const response = await axios.get('https://api.watchmode.com/v1/list-titles', { params })
        if (response.data && response.data.titles) {
          // Deduplicate by ID
          const newTitles = response.data.titles.filter(t => !allTitles.some(at => at.id === t.id))
          allTitles = allTitles.concat(newTitles)
          // Fetch sources/details for new titles only
          const withSources = await Promise.all(newTitles.map(async (item) => {
            try {
              const [srcResp, detailsResp] = await Promise.all([
                axios.get(`https://api.watchmode.com/v1/title/${item.id}/sources`, {
                  params: { apiKey: '4PSbldWKiYnq4HwWBM7DdVe0UAfbJjLBAgNyAgDN' }
                }),
                axios.get(`https://api.watchmode.com/v1/title/${item.id}/details`, {
                  params: { apiKey: '4PSbldWKiYnq4HwWBM7DdVe0UAfbJjLBAgNyAgDN' }
                })
              ])
              const auSources = srcResp.data.filter(s => s.region === 'AU' && (s.type === 'sub' || s.type === 'free'))
              const criticScore = detailsResp.data.critic_score
              const image_url = detailsResp.data.posterLarge || detailsResp.data.posterMedium || detailsResp.data.poster || item.poster
              return { ...item, auSources, criticScore, image_url }
            } catch {
              return { ...item, auSources: [], criticScore: null, image_url: item.poster }
            }
          }))
          // Client-side filter: only show titles available on at least one selected provider in AU
          const providerFiltered = withSources.filter(item => {
            if (selectedProviderIds.length === 0) return true
            const auSourceIds = item.auSources.map(src => src.source_id)
            return selectedProviderIds.some(id => auSourceIds.includes(id))
          })
          // Filter out titles with criticScore < 80
          const criticFiltered = providerFiltered.filter(
            item => typeof item.criticScore === 'number' && item.criticScore >= 80
          )
          // Exclude already shown IDs
          const unseen = criticFiltered.filter(item => !newShownIds.includes(item.id))
          found = found.concat(unseen)
        }
        page++
      }
      // If not enough new results, reset shownIds and try again (once)
      if (found.length < 3 && shownIds.length > 0) {
        setShownIds([])
        // Try again with a fresh pool
        setTimeout(handleRoulette, 0)
        return
      }
      // Shuffle and pick 3
      const shuffled = [...found].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, 3)
      setRecommendations(selected)
      setShownIds([...shownIds, ...selected.map(item => item.id)])
    } catch (error) {
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>What Next?</h1>
        <p>Find your next binge-worthy content</p>
      </header>
      <main className="app-main">
        <div className="filters-section">
          <div className="filter-group">
            <label>Streaming Providers (Australia)</label>
            <Select
              isMulti
              options={australianProviders}
              value={selectedProviders}
              onChange={setSelectedProviders}
              placeholder="Select streaming providers..."
              className="select-container"
            />
          </div>
          <div className="filter-group">
            <label>Content Type</label>
            <Select
              isMulti
              options={contentTypes}
              value={selectedTypes}
              onChange={setSelectedTypes}
              placeholder="Select content type..."
              className="select-container"
            />
          </div>
          <div className="filter-group">
            <label>Genre</label>
            <Select
              isMulti
              options={genres}
              value={selectedGenres}
              onChange={setSelectedGenres}
              placeholder="Select genres..."
              className="select-container"
            />
          </div>
          <button 
            className="roulette-button"
            onClick={handleRoulette}
            disabled={loading}
          >
            {loading ? 'Finding Recommendations...' : '🎰 Spin the Roulette!'}
          </button>
        </div>
        <div className="recommendations-section">
          {recommendations.length > 0 ? (
            <div className="recommendations-grid">
              {recommendations.map((item, index) => (
                <div key={item.id || index} className="recommendation-card">
                  <div className="card-image">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} />
                    ) : (
                      <div className="placeholder-image">
                        <span>🎬</span>
                      </div>
                    )}
                  </div>
                  <div className="card-content">
                    <h3>{item.title}</h3>
                    <p className="card-type">{item.type === 'movie' ? 'Movie' : 'TV Series'}</p>
                    {item.year && <p className="card-year">{item.year}</p>}
                    {item.user_rating && (
                      <p className="card-rating">⭐ {item.user_rating.toFixed(1)}</p>
                    )}
                    {typeof item.criticScore === 'number' && (
                      <p className="card-rating" style={{ color: '#2563eb' }}>Critic Score: {item.criticScore}</p>
                    )}
                    {item.overview && (
                      <p className="card-overview">{item.overview.substring(0, 100)}...</p>
                    )}
                    {!item.overview && (
                      <p className="card-overview">No description available</p>
                    )}
                    {/* Streaming providers for AU */}
                    <div className="card-providers" style={{ marginTop: '1rem' }}>
                      {item.auSources && item.auSources.length > 0 ? (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9rem', color: '#6b7280', marginRight: 4 }}>Available on:</span>
                          {item.auSources.map(src => {
                            const info = getSourceInfo(src.source_id)
                            return info ? (
                              <img key={src.source_id} src={info.logo_100px} alt={info.name} title={info.name} style={{ height: 28, borderRadius: 6, background: '#fff', border: '1px solid #eee', padding: 2 }} />
                            ) : (
                              <span key={src.source_id}>{src.name}</span>
                            )
                          })}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.9rem', color: '#b91c1c' }}>Not available for streaming in AU</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-recommendations">
              <p>🎬 Select your preferences above and click the roulette button to get recommendations!</p>
              <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.7 }}>
                Tip: You can leave filters empty to get random recommendations from all available content.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
