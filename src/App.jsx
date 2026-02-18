import { supabase } from './supabase'
import { useState, useEffect } from 'react'
import './App.css'
import LäggTillBastu from './LäggTillBastu'
import Admin from './Admin'
import BastuDetalj from './BastuDetalj'

function App() {
  const [bastur, setBastur] = useState([])
  const [laddar, setLaddar] = useState(true)
  const [fel, setFel] = useState(null)
  const [sok, setSok] = useState('')
  const [visaFormulär, setVisaFormulär] = useState(false)
  const [visaAdmin, setVisaAdmin] = useState(false)
  const [valdBastu, setValdBastu] = useState(null)

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
  b.name.toLowerCase().includes(sok.toLowerCase()) ||
  (b.stad && b.stad.toLowerCase().includes(sok.toLowerCase()))
)

  return (
  <div className="app">
    <header className="header">
      <h1>Bastufinnaren</h1>
      <p>Hitta offentliga bastur i Sverige</p>
      <button 
        className="admin-knapp"
        onClick={() => setVisaAdmin(!visaAdmin)}
      >
        {visaAdmin ? '← Tillbaka' : '⚙️ Admin'}
      </button>
    </header>

    {visaAdmin ? (
      <Admin />
    ) : (
      <main className="main">
        <input
          className="sok-input"
          type="text"
          placeholder="Sök stad eller ort..."
          value={sok}
          onChange={e => setSok(e.target.value)}
        />

        <button 
          className="lagg-till-knapp"
          onClick={() => setVisaFormulär(true)}
        >
          + Föreslå bastu
        </button>

        {laddar && <p className="status">Hämtar bastur...</p>}
        {fel && <p className="status">{fel}</p>}

        {!laddar && !fel && (
          <div className="bastur-lista">
            <p className="status">{basturMedNamn.length} bastur hittades</p>
            {basturMedNamn.map(bastu => (
                <div 
                  key={bastu.id} 
                  className="bastu-kort" 
                  onClick={() => setValdBastu(bastu)}
                  style={{ cursor: 'pointer' }}
                >
                <h2>{bastu.name}</h2>
                {bastu.stad && <p className="stad">📍 {bastu.stad}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    )}

    {visaFormulär && (
      <LäggTillBastu onStäng={() => setVisaFormulär(false)} />
    )}

    {valdBastu && (
  <BastuDetalj 
    bastu={valdBastu} 
    onStäng={() => setValdBastu(null)} 
  />
)}
  </div>
)
}

export default App