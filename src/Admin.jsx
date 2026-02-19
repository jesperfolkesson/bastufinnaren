import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './Admin.css'
import RedigeraForslag from './RedigeraForslag'

export default function Admin() {
  const [förslag, setFörslag] = useState([])
  const [laddar, setLaddar] = useState(true)
  const [redigerar, setRedigerar] = useState(null)

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
        console.log('Hämtade:', data.length, 'förslag') 
      setFörslag(data)
    }
    setLaddar(false)
  }

  async function godkänn(förslagId) {
    setLaddar(true)

      // Hämta senaste versionen från databasen
  const { data: aktuellt } = await supabase
    .from('bastuar_forslag')
    .select('*')
    .eq('id', förslagId)
    .single()

  if (!aktuellt) {
    alert('Kunde inte hitta förslaget')
    setLaddar(false)
    return
  }

    const { data: befintlig } = await supabase
    .from('bastuar')
    .select('name, stad')
    .ilike('name', aktuellt.name)
    .limit(1)

  if (befintlig && befintlig.length > 0) {
    const bekräfta = window.confirm(
      `En bastu med namnet "${aktuellt.name}" finns redan i ${befintlig[0].stad}.\n\nVill du ändå lägga till denna?`
    )
    if (!bekräfta) {
      setLaddar(false)
      return
    }
  }

    // Geocoding: konvertera adress till koordinater
    const coords = await geocodeAddress(aktuellt.address)
    
    console.log('Koordinater:', coords) // ← LÄGG TILL
    console.log('Försöker godkänna:', JSON.stringify(aktuellt, null, 2))

    // Lägg till i huvudtabellen
    const { error: insertError } = await supabase
    .from('bastuar')
    .insert([{
        name: aktuellt.name,
        address: aktuellt.address,  // ← LÄGG TILL DENNA RAD
        lat: coords?.lat || null,
        lon: coords?.lon || null,
        stad: aktuellt.stad,
        fee: aktuellt.fee,
        opening_hours: aktuellt.opening_hours,
        website: aktuellt.website,
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
        .update({ 
            status: 'approved',
            lat: coords?.lat || null,
            lon: coords?.lon || null
        })
        .eq('id', förslagId)

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
  // Försök 1: Exakt adress
  let coords = await tryGeocode(address)
  if (coords && coords.lat > 55 && coords.lat < 70) return coords
  
  // Försök 2: Adress + ", Sverige"
  coords = await tryGeocode(address + ', Sverige')
  if (coords && coords.lat > 55 && coords.lat < 70) return coords
  
  return null
}

async function tryGeocode(query) {
  try {
    await new Promise(r => setTimeout(r, 1000)) // Vänta 1 sekund
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
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
              <button className="redigera" onClick={() => setRedigerar(f)}>✎ Redigera</button>
              <button className="godkann" onClick={() => godkänn(f.id)}>✓ Godkänn</button>
              <button className="neka" onClick={() => neka(f.id)}>✕ Neka</button>
            </div>
          </div>
        ))}
      </div>
    )}

    {redigerar && (
      <RedigeraForslag 
        förslag={redigerar} 
        onStäng={() => setRedigerar(null)}
        onUppdaterad={() => hämtaFörslag()}
      />
    )}
  </div>
    )   
}