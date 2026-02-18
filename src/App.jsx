import { supabase } from './supabase'
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [bastur, setBastur] = useState([])
  const [laddar, setLaddar] = useState(true)
  const [fel, setFel] = useState(null)
  const [sok, setSok] = useState('')

  useEffect(() => {
  async function hamtaBastur() {
    const { data, error } = await supabase
      .from('bastuar')
      .select('*')
    
    if (error) {
      console.log('Supabase-fel:', error)
      setFel('Kunde inte hämta bastur från databasen.')
      setLaddar(false)
    } else {
      console.log('Hämtade bastur:', data)
      setBastur(data)
      setLaddar(false)
    }
  }
  
  hamtaBastur()
}, [])

  const basturMedNamn = bastur
  .filter(b => b.name)
  .filter(b =>
    b.name.toLowerCase().includes(sok.toLowerCase())
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

        {laddar && <p className="status">Hämtar bastur...</p>}
        {fel && <p className="status">{fel}</p>}

        {!laddar && !fel && (
          <div className="bastur-lista">
            <p className="status">{basturMedNamn.length} bastur hittades</p>
            {basturMedNamn.map(bastu => (
              <div key={bastu.id} className="bastu-kort">
                <h2>{bastu.name}</h2>
                {bastu.fee && <p>Avgift: {bastu.fee}</p>}
                {bastu.opening_hours && <p>Oppettider: {bastu.opening_hours}</p>}
                {bastu.website && (
                  <a href={bastu.website} target="_blank">Webbplats</a>
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