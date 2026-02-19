import { useState } from 'react'
import { supabase } from './supabase'
import './LäggTillBastu.css' // Återanvänder samma styling

export default function RedigeraForslag({ förslag, onStäng, onUppdaterad }) {
  const [form, setForm] = useState({
    name: förslag.name || '',
    address: förslag.address || '',
    stad: förslag.stad || '',
    fee: förslag.fee || '',
    opening_hours: förslag.opening_hours || '',
    website: förslag.website || ''
  })
  const [sparar, setSparar] = useState(false)
  const [meddelande, setMeddelande] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.name || !form.address || !form.stad) {
      setMeddelande({ typ: 'fel', text: 'Namn, adress och stad är obligatoriska' })
      return
    }

    setSparar(true)
    setMeddelande(null)

    const { error } = await supabase
      .from('bastuar_forslag')
      .update({
        name: form.name,
        address: form.address,
        stad: form.stad,
        fee: form.fee || null,
        opening_hours: form.opening_hours || null,
        website: form.website || null
      })
      .eq('id', förslag.id)

    setSparar(false)

    if (error) {
      setMeddelande({ typ: 'fel', text: 'Kunde inte spara ändringar' })
    } else {
      setMeddelande({ typ: 'success', text: 'Ändringar sparade!' })
      setTimeout(() => {
        onUppdaterad()
        onStäng()
      }, 1500)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onStäng}>
      <div className="modal-innehall" onClick={e => e.stopPropagation()}>
        <button className="stäng-knapp" onClick={onStäng}>✕</button>
        
        <h2>Redigera förslag</h2>
        <p className="beskrivning">Rätta felstavningar eller komplettera information</p>

        <form onSubmit={handleSubmit}>
          <label>
            Namn *
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Adress *
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Stad/Ort *
            <input
              type="text"
              name="stad"
              value={form.stad}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Avgift
            <input
              type="text"
              name="fee"
              value={form.fee}
              onChange={handleChange}
            />
          </label>

          <label>
            Öppettider
            <input
              type="text"
              name="opening_hours"
              value={form.opening_hours}
              onChange={handleChange}
            />
          </label>

          <label>
            Webbplats
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
            />
          </label>

          {meddelande && (
            <div className={`meddelande ${meddelande.typ}`}>
              {meddelande.text}
            </div>
          )}

          <button type="submit" disabled={sparar} className="skicka-knapp">
            {sparar ? 'Sparar...' : 'Spara ändringar'}
          </button>
        </form>
      </div>
    </div>
  )
}