import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './Admin.css'

export default function Admin() {
  const [förslag, setFörslag] = useState([])
  const [laddar, setLaddar] = useState(true)

  useEffect(() => {
    hämtaFörslag()
  }, [])

  async function hämtaFörslag() {
    const { data, error } = await supabase
      .from('bastuar_forslag')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fel:', error)
    } else {
      setFörslag(data)
    }
    setLaddar(false)
  }

  async function godkänn(förslag) {
    setLaddar(true)

    // Geocoding: konvertera adress till koordinater
    const coords = await geocodeAddress(förslag.address)
    
    if (!coords) {
      alert('Kunde inte hitta koordinater för adressen. Kolla att den är korrekt.')
      setLaddar(false)
      return
    }

    // Lägg till i huvudtabellen
    const { error: insertError } = await supabase
      .from('bastuar')
      .insert([{
        name: förslag.name,
        lat: coords.lat,
        lon: coords.lon,
        stad: förslag.stad,
        fee: förslag.fee,
        opening_hours: förslag.opening_hours,
        website: förslag.website,
        osm_id: null
      }])

    if (insertError) {
      alert('Fel vid godkännande: ' + insertError.message)
      setLaddar(false)
      return
    }

    // Uppdatera status till 'approved'
    await supabase
      .from('bastuar_forslag')
      .update({ status: 'approved' })
      .eq('id', förslag.id)

    hämtaFörslag()
  }

  async function neka(id) {
    setLaddar(true)
    
    await supabase
      .from('bastuar_forslag')
      .update({ status: 'rejected' })
      .eq('id', id)

    hämtaFörslag()
  }

  async function geocodeAddress(address) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'Bastufinnaren/1.0' } }
      )
      const data = await response.json()
      
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        }
      }
      return null
    } catch (err) {
      console.error('Geocoding-fel:', err)
      return null
    }
  }

  if (laddar) return <div className="admin-container"><p>Laddar...</p></div>

  return (
    <div className="admin-container">
      <h1>Admin — Granska förslag</h1>
      
      {förslag.length === 0 ? (
        <p className="ingen-data">Inga förslag väntar på granskning</p>
      ) : (
        <div className="forslag-lista">
          {förslag.map(f => (
            <div key={f.id} className="forslag-kort">
              <h2>{f.name}</h2>
              <p><strong>Adress:</strong> {f.address}</p>
              <p><strong>Stad:</strong> {f.stad}</p>
              {f.fee && <p><strong>Avgift:</strong> {f.fee}</p>}
              {f.opening_hours && <p><strong>Öppettider:</strong> {f.opening_hours}</p>}
              {f.website && <p><strong>Webbplats:</strong> <a href={f.website} target="_blank">{f.website}</a></p>}
              <p className="datum">Inskickat: {new Date(f.created_at).toLocaleDateString('sv-SE')}</p>
              
              <div className="knappar">
                <button className="godkann" onClick={() => godkänn(f)}>✓ Godkänn</button>
                <button className="neka" onClick={() => neka(f.id)}>✕ Neka</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}