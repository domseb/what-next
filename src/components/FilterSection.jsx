import Select from 'react-select'

const darkSelectStyles = {
  control: (base, state) => ({
    ...base,
    background: '#18192b',
    borderColor: state.isFocused ? '#ff3300' : '#333',
    color: '#fff',
    boxShadow: state.isFocused ? '0 0 0 2px #ff3300' : base.boxShadow,
    minHeight: 36,
    height: 36,
  }),
  menu: (base) => ({
    ...base,
    background: '#18192b',
    color: '#fff',
    zIndex: 20,
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? '#23244a' : '#18192b',
    color: '#fff',
    cursor: 'pointer',
  }),
  multiValue: (base) => ({
    ...base,
    background: '#23244a',
    color: '#fff',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#fff',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#ff3300',
    ':hover': {
      background: '#ff3300',
      color: '#fff',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: '#aaa',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#fff',
  }),
  input: (base) => ({
    ...base,
    color: '#fff',
  }),
};

const FilterSection = ({
  australianProviders,
  genres,
  contentTypes,
  selectedProviders,
  setSelectedProviders,
  selectedTypes,
  setSelectedTypes,
  selectedGenres,
  setSelectedGenres,
  handleRoulette,
  loading
}) => (
  <div className="filters-inline" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
    <div style={{ minWidth: 220 }}>
      <Select
        isMulti
        closeMenuOnSelect={false}
        options={australianProviders}
        value={selectedProviders}
        onChange={setSelectedProviders}
        placeholder="Streamer"
        className="select-container"
        styles={darkSelectStyles}
      />
    </div>
    <div style={{ minWidth: 180 }}>
      <Select
        isMulti
        closeMenuOnSelect={false}
        options={contentTypes}
        value={selectedTypes}
        onChange={setSelectedTypes}
        placeholder="Type"
        className="select-container"
        styles={darkSelectStyles}
      />
    </div>
    <div style={{ minWidth: 180 }}>
      <Select
        isMulti
        closeMenuOnSelect={false}
        options={genres}
        value={selectedGenres}
        onChange={setSelectedGenres}
        placeholder="Genre"
        className="select-container"
        styles={darkSelectStyles}
      />
    </div>
    <button 
      className="roulette-button"
      onClick={handleRoulette}
      disabled={loading}
      style={{ marginLeft: 'auto', minWidth: 180, height: 36, fontSize: '0.95rem', padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {loading ? <span style={{ display: 'inline-block', width: 22, height: 22, verticalAlign: 'middle' }}><span style={{ display: 'block', width: 22, height: 22, border: '3px solid #fff', borderTop: '3px solid #ff3300', borderRadius: '50%', animation: 'spin 1s linear infinite', boxSizing: 'border-box' }} /><style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style></span> : 'Spin the Roulette!'}
    </button>
  </div>
)

export default FilterSection 