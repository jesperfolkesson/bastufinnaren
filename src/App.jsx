import { useState, useEffect } from 'react'
import './App.css'

const API_URL = `https://overpass.kumi.systems/api/interpreter?data=[out:json];area["ISO3166-1"="SE"]->.sweden;node["leisure"="sauna"](area.sweden);out body;`

function App() {
  const [bastur, setBastur] = useState([])
  const [laddar, setLaddar] = useState(true)
  const [fel, setFel] = useState(null)
  const [sok, setSok] = useState('')

  useEffect(() => {
  const sparad = sessionStorage.getItem('bastur')
  if (sparad) {
    setBastur(JSON.parse(sparad))
    setLaddar(false)
    return
  }

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      setBastur(data.elements)
      sessionStorage.setItem('bastur', JSON.stringify(data.elements))
      setLaddar(false)
    })
    .catch(err => {
      setFel('Kunde inte hämta data. Prova att ladda om sidan.')
      setLaddar(false)
    })
}, [])

  const basturMedNamn = bastur
  .filter(b =>
    b.tags.name && (
      b.tags.fee ||
      b.tags.opening_hours ||
      b.tags.website
    )
  )
  .filter(b =>
    b.tags.name.toLowerCase().includes(sok.toLowerCase())
  )

  return (
    <div className="app">

      <header className="header">
        <h1>Bastufinnaren</h1>
        <p>Hitta offentliga bastur i Sverige</p>
      </header>

      <main className="main">
        <input
          className="sok-input"
          type="text"
          placeholder="Sök stad eller ort..."
          value={sok}
          onChange={e => setSok(e.target.value)}
        />

        {laddar && <p className="status">Hamtar bastur...</p>}
        {fel && <p className="status">{fel}</p>}

        {!laddar && !fel && (
          <div className="bastur-lista">
            <p className="status">{basturMedNamn.length} bastur hittades</p>
            {basturMedNamn.map(bastu => (
              <div key={bastu.id} className="bastu-kort">
                <h2>{bastu.tags.name}</h2>
                {bastu.tags.fee && <p>Avgift: {bastu.tags.fee}</p>}
                {bastu.tags.opening_hours && <p>Oppettider: {bastu.tags.opening_hours}</p>}
                {bastu.tags.website && (
                  <a href={bastu.tags.website} target="_blank">Webbplats</a>
                )}
              </div>
            ))}
          </div>
        )}

      </main>

    </div>
  )
}

export default App