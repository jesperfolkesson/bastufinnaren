import { useState } from 'react'
import { supabase } from './supabase'
import './LäggTillBastu.css'

export default function LäggTillBastu({ onStäng }) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    stad: '',
    fee: '',
    opening_hours: '',
    website: ''
  })
  const [skickar, setSkickar] = useState(false)
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

    setSkickar(true)
    setMeddelande(null)

    const { error } = await supabase
      .from('bastuar_forslag')
      .insert([{
        name: form.name,
        address: form.address,
        stad: form.stad || null,
        fee: form.fee || null,
        opening_hours: form.opening_hours || null,
        website: form.website || null
      }])

    setSkickar(false)

    if (error) {
      setMeddelande({ typ: 'fel', text: 'Något gick fel. Försök igen.' })
    } else {
      setMeddelande({ typ: 'success', text: 'Tack för ditt förslag! Vi granskar det så snart som möjligt.' })
      setForm({ name: '', address: '', stad: '', fee: '', opening_hours: '', website: '' })
      setTimeout(() => onStäng(), 3000)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onStäng}>
      <div className="modal-innehall" onClick={e => e.stopPropagation()}>
        <button className="stäng-knapp" onClick={onStäng}>✕</button>
        
        <h2>Föreslå en bastu</h2>
        <p className="beskrivning">Känner du till en offentlig bastu som saknas? Hjälp oss bygga databasen!</p>

        <form onSubmit={handleSubmit}>
          <label>
            Namn *
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="t.ex. Ribersborgs Kallbadhus"
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
              placeholder="t.ex. Ribersborgsstranden, Malmö"
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
              placeholder="t.ex. Malmö"
              required
            />
          </label>

          <label>
            Avgift (valfritt)
            <input
              type="text"
              name="fee"
              value={form.fee}
              onChange={handleChange}
              placeholder="t.ex. 90 kr eller Gratis"
            />
          </label>

          <label>
            Öppettider (valfritt)
            <input
              type="text"
              name="opening_hours"
              value={form.opening_hours}
              onChange={handleChange}
              placeholder="t.ex. Mån-Fre 09-20"
            />
          </label>

          <label>
            Webbplats (valfritt)
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>

          {meddelande && (
            <div className={`meddelande ${meddelande.typ}`}>
              {meddelande.text}
            </div>
          )}

          <button type="submit" disabled={skickar} className="skicka-knapp">
            {skickar ? 'Skickar...' : 'Skicka förslag'}
          </button>
        </form>
      </div>
    </div>
  )
}