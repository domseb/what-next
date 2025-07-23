import { useState, useEffect, useRef } from 'react'
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
  const [shownIds, setShownIds] = useState([])
  const contentTypes = [
    { value: 'movie', label: 'Movie' },
    { value: 'tv_series', label: 'TV Series' }
  ];

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
          loading={loading}
        />
        <div className="recommendations-section">
          <RecommendationGrid recommendations={recommendations} getSourceInfo={getSourceInfo} loading={loading} />
        </div>
      </main>
    </div>
  )
}

export default App
