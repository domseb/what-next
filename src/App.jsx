import { useState, useEffect, useRef, useCallback } from 'react'
import Select from 'react-select'
import axios from 'axios'
import './App.css'
import FilterSection from './components/FilterSection'
import RecommendationGrid from './components/RecommendationGrid'
import NoResults from './components/NoResults'

function App() {
  const [region, setRegion] = useState({ value: 'AU', label: 'Australia' });
  const [selectedProviders, setSelectedProviders] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState([])
  const [genres, setGenres] = useState([])
  const [allSources, setAllSources] = useState([])
  const [allDetailedResults, setAllDetailedResults] = useState([])
  const [shownIds, setShownIds] = useState([])
  const [current3, setCurrent3] = useState([])
  const [lastFetchLoading, setLastFetchLoading] = useState(false)
  const lastFiltersRef = useRef({ providers: [], types: [], genres: [] })
  const contentTypes = [
    { value: 'movie', label: 'Movie' },
    { value: 'tv_series', label: 'TV Series' }
  ];
  const [pageKey, setPageKey] = useState(0)

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

  // Fetch genres from Watchmode API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get('https://api.watchmode.com/v1/genres', {
          params: {
            apiKey: 'X7qaTQtdajZuOnkoShL30ZtY0wbQ1CHCHOPBF8d4'
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

  // Fetch all streaming sources for provider logos/info
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await axios.get('https://api.watchmode.com/v1/sources', {
          params: { apiKey: 'X7qaTQtdajZuOnkoShL30ZtY0wbQ1CHCHOPBF8d4' }
        })
        setAllSources(response.data)
        console.log('Fetched allSources:', response.data)
      } catch (error) {
        console.error('Failed to fetch sources:', error)
      }
    }
    fetchSources()
  }, [])

  // Helper to get source info by id
  const getSourceInfo = (id) => allSources.find(s => s.id === id)

  // Helper to pick 3 random, unseen titles from the pool
  const pick3Random = useCallback((pool, alreadyShown) => {
    const unseen = pool.filter(item => !alreadyShown.includes(item.id))
    let picks = []
    let newShown = [...alreadyShown]
    if (unseen.length < 3) {
      // If not enough unseen, reset
      newShown = []
      picks = pool.sort(() => 0.5 - Math.random()).slice(0, 3)
      newShown = picks.map(item => item.id)
    } else {
      picks = unseen.sort(() => 0.5 - Math.random()).slice(0, 3)
      newShown = [...alreadyShown, ...picks.map(item => item.id)]
    }
    return { picks, newShown }
  }, [])

  // Helper to compare filters
  const filtersEqual = (a, b) => {
    const arrEq = (x, y) => x.length === y.length && x.every((v, i) => v === y[i])
    return arrEq(a.providers, b.providers) && arrEq(a.types, b.types) && arrEq(a.genres, b.genres)
  }

  // Handle roulette spin (fetch if filters changed, else just pick 3 new)
  const handleRoulette = useCallback(async () => {
    // Build current filters
    const currentFilters = {
      providers: selectedProviders.map(p => p.value).sort(),
      types: selectedTypes.map(t => t.value).sort(),
      genres: selectedGenres.map(g => g.value).sort(),
    }
    // If filters changed, fetch new pool
    if (!filtersEqual(currentFilters, lastFiltersRef.current)) {
      setLastFetchLoading(true)
      setAllDetailedResults([])
      setShownIds([])
      setCurrent3([])
      try {
        const params = {
          apiKey: 'X7qaTQtdajZuOnkoShL30ZtY0wbQ1CHCHOPBF8d4',
          sort_by: 'relevance_desc',
          regions: 'AU',
        }
        if (currentFilters.types.length > 0) {
          params.types = currentFilters.types.join(',')
        }
        if (currentFilters.genres.length > 0) {
          params.genres = currentFilters.genres.join(',')
        }
        if (currentFilters.providers.length > 0) {
          params.source_ids = currentFilters.providers.join(',')
        }
        const response = await axios.get('https://api.watchmode.com/v1/list-titles', { params })
        const titles = response.data.titles || []
        // Fetch details/sources for all 250
        const detailed = await Promise.all(titles.map(async (item) => {
          try {
            const [detailsResp, sourcesResp] = await Promise.all([
              axios.get(`https://api.watchmode.com/v1/title/${item.id}/details`, {
                params: { apiKey: params.apiKey }
              }),
              axios.get(`https://api.watchmode.com/v1/title/${item.id}/sources`, {
                params: { apiKey: params.apiKey }
              })
            ])
            const details = detailsResp.data
            const sources = sourcesResp.data
            const auSources = sources.filter(s => s.region === 'AU' && (s.type === 'sub' || s.type === 'free'))
            return {
              ...item,
              image_url: details.posterLarge || details.poster || details.posterMedium || '',
              criticScore: details.critic_score,
              auSources,
            }
          } catch {
            return { ...item, image_url: '', criticScore: null, auSources: [] }
          }
        }))
        // Filter out scores under 70
        const filteredByScore = detailed.filter(item => (item.criticScore || 0) >= 70)
        setAllDetailedResults(filteredByScore)
        // Pick initial 3 at random from the filtered pool
        const { picks, newShown } = pick3Random(filteredByScore, [])
        setCurrent3(picks)
        setShownIds(newShown)
        lastFiltersRef.current = currentFilters
      } catch (error) {
        setAllDetailedResults([])
        setCurrent3([])
        setShownIds([])
      } finally {
        setLastFetchLoading(false)
      }
    } else {
      // Just pick 3 new from the stored pool
      if (allDetailedResults.length === 0) return
      const { picks, newShown } = pick3Random(allDetailedResults, shownIds)
      setCurrent3(picks)
      setShownIds(newShown)
      setPageKey(prev => prev + 1)
    }
  }, [selectedProviders, selectedTypes, selectedGenres, allDetailedResults, shownIds, pick3Random])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement.tagName.toLowerCase();
      if ((e.key === 'Enter' || e.key === 'r') && tag !== 'input' && tag !== 'select' && tag !== 'textarea') {
        e.preventDefault();
        handleRoulette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRoulette]);

  return (
    <div className="app">
      <main className="app-main">
        <FilterSection
          region={region}
          setRegion={setRegion}
          australianProviders={australianProviders}
          genres={genres}
          contentTypes={contentTypes}
          selectedProviders={selectedProviders}
          setSelectedProviders={setSelectedProviders}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          selectedGenres={selectedGenres}
          setSelectedGenres={setSelectedGenres}
          handleRoulette={handleRoulette}
          loading={loading || lastFetchLoading}
        />
        <div className="recommendations-section">
          <RecommendationGrid recommendations={current3} getSourceInfo={getSourceInfo} loading={loading || lastFetchLoading} pageKey={pageKey} />
        </div>
      </main>
    </div>
  )
}

export default App
