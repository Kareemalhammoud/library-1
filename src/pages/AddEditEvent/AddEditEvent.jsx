import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createEvent, getEvent, updateEvent } from '@/utils/api'

const CATEGORIES = ['Workshops', 'Author Talks', 'Exhibitions', 'Book Clubs', 'Film', 'Kids & Families', 'Community']
const FORMATS = ['In-Person', 'Online']

const EMPTY = {
  title: '',
  date: '',
  time: '',
  location: '',
  category: 'Workshops',
  format: 'In-Person',
  featured: false,
  image: '',
  description: '',
  longDescription: '',
  speaker: '',
  seats: '',
  registered: '',
}

const labelClass = 'mb-1 block text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#5a6b62] dark:text-[#8c9691]'
const inputClass = 'w-full rounded-md border border-[#d0ddd8] bg-white px-3 py-2 text-[0.86rem] text-[#1C2B24] outline-none transition focus:border-[#006751] focus:ring-2 focus:ring-[#006751]/15 dark:border-[#333] dark:bg-[#1f1f1f] dark:text-[#f5f7f6] dark:focus:border-[#5ecba1]'

function AddEditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    setLoading(true)
    getEvent(id)
      .then((data) => {
        if (cancelled) return
        setForm({
          title: data.title ?? '',
          date: (data.date ?? '').slice(0, 10),
          time: data.time ?? '',
          location: data.location ?? '',
          category: data.category ?? 'Workshops',
          format: data.format ?? 'In-Person',
          featured: Boolean(data.featured),
          image: data.image ?? '',
          description: data.description ?? '',
          longDescription: data.longDescription ?? '',
          speaker: data.speaker ?? '',
          seats: data.seats ?? '',
          registered: data.registered ?? '',
        })
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load event')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title.trim() || !form.date) {
      setError('Title and date are required.')
      return
    }

    const payload = {
      title: form.title.trim(),
      date: form.date,
      time: form.time.trim() || null,
      location: form.location.trim() || null,
      category: form.category || null,
      format: form.format || null,
      featured: form.featured ? 1 : 0,
      image: form.image.trim() || null,
      description: form.description.trim() || null,
      longDescription: form.longDescription.trim() || null,
      speaker: form.speaker.trim() || null,
      seats: form.seats === '' ? null : Number(form.seats),
      registered: form.registered === '' ? null : Number(form.registered),
    }

    setLoading(true)
    try {
      const saved = isEdit ? await updateEvent(id, payload) : await createEvent(payload)
      setSuccess(isEdit ? 'Event updated.' : 'Event created.')
      setTimeout(() => navigate(`/events/${saved.id ?? id}`), 700)
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.setItem('isLoggedIn', 'false')
        setError('Your session expired. Please log in again.')
      } else if (err.status === 403) {
        setError('Admin access required.')
      } else {
        setError(err.message || 'Save failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F5F3] px-5 py-10 text-[#1C2B24] sm:px-6 md:px-10 dark:bg-[#121212] dark:text-[#f5f7f6]">
      <div className="mx-auto max-w-[760px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-[0.78rem] font-semibold text-[#5a6b62] transition hover:text-[#006751] dark:text-[#8c9691] dark:hover:text-[#5ecba1]"
        >
          <span aria-hidden="true">&larr;</span>
          Back
        </button>

        <h1 className="mb-1 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-[-0.03em]">
          {isEdit ? 'Edit Event' : 'Add Event'}
        </h1>
        <p className="mb-7 text-[0.86rem] text-[#5a6b62] dark:text-[#8c9691]">
          {isEdit ? 'Update event details and save.' : 'Create a new event for the library calendar.'}
        </p>

        {error && (
          <div className="mb-5 rounded-md border border-[#e6c5c0] bg-[#fbecea] px-4 py-3 text-[0.84rem] text-[#7a2a1f] dark:border-[#5b3631] dark:bg-[#3a1f1c] dark:text-[#ff9388]">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 rounded-md border border-[#bcd9cb] bg-[#e7f3ec] px-4 py-3 text-[0.84rem] text-[#1a6644] dark:border-[#264c3a] dark:bg-[#1c3327] dark:text-[#5ecba1]">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-[14px] border border-[#d0ddd8] bg-white p-6 shadow-sm dark:border-[#333] dark:bg-[#1f1f1f]">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className={labelClass}>Title <span className="text-[#b5392b]">*</span></label>
              <input id="title" name="title" type="text" required value={form.title} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label htmlFor="date" className={labelClass}>Date <span className="text-[#b5392b]">*</span></label>
              <input id="date" name="date" type="date" required value={form.date} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="time" className={labelClass}>Time</label>
              <input id="time" name="time" type="text" placeholder="e.g. 2:00 PM - 4:00 PM" value={form.time} onChange={handleChange} className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="location" className={labelClass}>Location</label>
              <input id="location" name="location" type="text" placeholder="e.g. Riyad Nassar Library, Beirut" value={form.location} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label htmlFor="category" className={labelClass}>Category</label>
              <select id="category" name="category" value={form.category} onChange={handleChange} className={inputClass}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="format" className={labelClass}>Format</label>
              <select id="format" name="format" value={form.format} onChange={handleChange} className={inputClass}>
                {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="image" className={labelClass}>Image URL</label>
              <input id="image" name="image" type="url" placeholder="https://..." value={form.image} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label htmlFor="speaker" className={labelClass}>Speaker</label>
              <input id="speaker" name="speaker" type="text" value={form.speaker} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="seats" className={labelClass}>Seats</label>
              <input id="seats" name="seats" type="number" min="0" value={form.seats} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label htmlFor="registered" className={labelClass}>Already registered</label>
              <input id="registered" name="registered" type="number" min="0" value={form.registered} onChange={handleChange} className={inputClass} />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-[0.86rem] text-[#1C2B24] dark:text-[#f5f7f6]">
                <input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} className="h-4 w-4 rounded border-[#d0ddd8] text-[#006751] focus:ring-[#006751] dark:border-[#444]" />
                Mark as featured event
              </label>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className={labelClass}>Short description</label>
              <textarea id="description" name="description" rows="3" value={form.description} onChange={handleChange} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="longDescription" className={labelClass}>Long description</label>
              <textarea id="longDescription" name="longDescription" rows="6" value={form.longDescription} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#1a6644] px-5 py-2.5 text-[0.84rem] font-semibold text-white transition hover:bg-[#14533a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create event'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-md border border-[#d0ddd8] px-5 py-2.5 text-[0.84rem] font-semibold text-[#5a6b62] transition hover:border-[#006751] hover:text-[#006751] dark:border-[#333] dark:text-[#8c9691] dark:hover:border-[#5ecba1] dark:hover:text-[#5ecba1]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default AddEditEvent
