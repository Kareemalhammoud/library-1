import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createEvent, deleteEvent, getEvent, updateEvent } from '@/utils/api'
import { isAdminUser } from '@/utils'

const emptyForm = {
  title: '',
  date: '',
  time: '',
  location: '',
  category: '',
  format: '',
  featured: false,
  image: '',
  description: '',
  longDescription: '',
  speaker: '',
  seats: '',
  registered: '',
  audience: '',
  takeaway: '',
  highlightsText: '',
}

const labelClassName =
  'text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#aaa] dark:text-[#888]'

const fieldClassName =
  'mt-2 box-border w-full rounded-lg border border-[#e0ddd8] bg-[#f8f7f4] px-4 py-[0.85rem] text-[0.9rem] text-[#1a1a1a] outline-none transition-colors placeholder:text-[#a7a7a7] focus:border-[#1a4a3a] focus:bg-white dark:border-[#333] dark:bg-[#2e2e2e] dark:text-white dark:placeholder:text-[#666] dark:focus:border-[#5ecba1] dark:focus:bg-[#2e2e2e]'

const primaryButtonClassName =
  'cursor-pointer rounded-lg border-0 bg-[#1a4a3a] px-6 py-[0.85rem] text-[0.9rem] font-semibold text-white transition-colors hover:bg-[#2d7a4f] disabled:cursor-not-allowed disabled:opacity-50'

const secondaryButtonClassName =
  'cursor-pointer rounded-lg border border-[#ccc] bg-white px-6 py-[0.85rem] text-[0.9rem] font-semibold text-[#555] transition-colors hover:bg-[#f0f0f0] dark:border-[#333] dark:bg-[#2e2e2e] dark:text-[#888] dark:hover:bg-[#333]'

const deleteButtonClassName =
  'cursor-pointer rounded-lg border-0 bg-[#c0392b] px-6 py-[0.85rem] text-[0.9rem] font-semibold text-white transition-colors hover:bg-[#a93226] disabled:cursor-not-allowed disabled:opacity-50'

function AddEditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const admin = isAdminUser()

  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!id) {
      setFormData(emptyForm)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    getEvent(id)
      .then((event) => {
        if (cancelled) return
        setFormData({
          title: event.title || '',
          date: event.date || '',
          time: event.time || '',
          location: event.location || '',
          category: event.category || '',
          format: event.format || '',
          featured: Boolean(event.featured),
          image: event.image || '',
          description: event.description || '',
          longDescription: event.longDescription || '',
          speaker: event.speaker || '',
          seats: event.seats ?? '',
          registered: event.registered ?? '',
          audience: event.audience || '',
          takeaway: event.takeaway || '',
          highlightsText: Array.isArray(event.highlights) ? event.highlights.join('\n') : '',
        })
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load event')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const pageTitle = useMemo(() => (id ? 'Edit Event' : 'Add New Event'), [id])

  if (!admin) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] px-4 py-16 text-center dark:bg-[#121212]">
        <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">Admin access required</h1>
      </main>
    )
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        title: formData.title,
        date: formData.date,
        time: formData.time || null,
        location: formData.location || null,
        category: formData.category || null,
        format: formData.format || null,
        featured: formData.featured,
        image: formData.image || null,
        description: formData.description || null,
        longDescription: formData.longDescription || null,
        speaker: formData.speaker || null,
        seats: formData.seats === '' ? null : Number(formData.seats),
        registered: formData.registered === '' ? 0 : Number(formData.registered),
        audience: formData.audience || null,
        takeaway: formData.takeaway || null,
        highlights: formData.highlightsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      }

      if (id) {
        await updateEvent(id, payload)
      } else {
        await createEvent(payload)
      }

      setSuccess(id ? 'Event updated successfully' : 'Event created successfully')
      setTimeout(() => navigate('/events'), 900)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!id) return

    const confirmed = window.confirm('Are you sure you want to delete this event?')
    if (!confirmed) return

    setDeleting(true)
    setError('')
    setSuccess('')

    try {
      await deleteEvent(id)
      setSuccess('Event deleted successfully')
      setTimeout(() => navigate('/events'), 700)
    } catch (err) {
      setError(err.message || 'Failed to delete event')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] pb-16 dark:bg-[#1a1a1a]">
      <nav
        className="flex items-center gap-4 border-b border-[#e5e2dc] bg-[#f8f7f4] px-4 py-4 sm:px-6 md:px-8 dark:border-[#333] dark:bg-[#1a1a1a]"
        aria-label="Breadcrumb"
      >
        <button
          type="button"
          className="cursor-pointer rounded-md border border-[#ccc] bg-transparent px-[0.9rem] py-[0.4rem] text-[0.85rem] text-[#555] hover:bg-[#eee] dark:border-[#333] dark:text-[#888] dark:hover:bg-[#2e2e2e]"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <span className="text-[0.85rem] text-[#999] dark:text-[#888]">
          Events / {pageTitle}
        </span>
      </nav>

      <article className="mx-auto mt-8 max-w-[1000px] px-4 sm:px-6 sm:mt-10 md:mt-12 md:px-8">
        <section className="rounded-xl border border-[#e5e2dc] bg-white p-6 dark:border-[#333] dark:bg-[#242424] sm:p-8">
          <div className="border-b border-[#e5e2dc] pb-6 dark:border-[#333]">
            <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#aaa] dark:text-[#888]">
              Our Libraries
            </p>
            <h1 className="m-0 text-[2rem] font-extrabold tracking-tight text-[#1a1a1a] dark:text-white">
              {pageTitle}
            </h1>
          </div>

          {loading && (
            <p className="mt-4 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Loading...
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div>
                <label htmlFor="title" className={labelClassName}>Title</label>
                <input id="title" name="title" value={formData.title} onChange={handleChange} required className={fieldClassName} />
              </div>

              <div>
                <label htmlFor="date" className={labelClassName}>Date</label>
                <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required className={fieldClassName} />
              </div>

              <div>
                <label htmlFor="time" className={labelClassName}>Time</label>
                <input id="time" name="time" value={formData.time} onChange={handleChange} className={fieldClassName} placeholder="6:00 PM - 7:30 PM" />
              </div>

              <div>
                <label htmlFor="location" className={labelClassName}>Location</label>
                <input id="location" name="location" value={formData.location} onChange={handleChange} className={fieldClassName} />
              </div>

              <div>
                <label htmlFor="category" className={labelClassName}>Category</label>
                <input id="category" name="category" value={formData.category} onChange={handleChange} className={fieldClassName} placeholder="Workshops" />
              </div>

              <div>
                <label htmlFor="format" className={labelClassName}>Format</label>
                <select id="format" name="format" value={formData.format} onChange={handleChange} className={fieldClassName}>
                  <option value="">Select format</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="image" className={labelClassName}>Image URL</label>
                <input id="image" name="image" value={formData.image} onChange={handleChange} className={fieldClassName} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className={labelClassName}>Short Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" className={`${fieldClassName} resize-y`} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="longDescription" className={labelClassName}>Long Description</label>
                <textarea id="longDescription" name="longDescription" value={formData.longDescription} onChange={handleChange} rows="6" className={`${fieldClassName} resize-y`} />
              </div>

              <div>
                <label htmlFor="speaker" className={labelClassName}>Speaker</label>
                <input id="speaker" name="speaker" value={formData.speaker} onChange={handleChange} className={fieldClassName} />
              </div>

              <div>
                <label htmlFor="audience" className={labelClassName}>Audience</label>
                <input id="audience" name="audience" value={formData.audience} onChange={handleChange} className={fieldClassName} />
              </div>

              <div>
                <label htmlFor="seats" className={labelClassName}>Seats</label>
                <input id="seats" name="seats" type="number" value={formData.seats} onChange={handleChange} className={fieldClassName} />
              </div>

              <div>
                <label htmlFor="registered" className={labelClassName}>Registered</label>
                <input id="registered" name="registered" type="number" value={formData.registered} onChange={handleChange} className={fieldClassName} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="takeaway" className={labelClassName}>Why Attend</label>
                <textarea id="takeaway" name="takeaway" value={formData.takeaway} onChange={handleChange} rows="4" className={`${fieldClassName} resize-y`} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="highlightsText" className={labelClassName}>Highlights (one per line)</label>
                <textarea id="highlightsText" name="highlightsText" value={formData.highlightsText} onChange={handleChange} rows="5" className={`${fieldClassName} resize-y`} />
              </div>

              <div className="sm:col-span-2">
                <label className="inline-flex items-center gap-3 text-[0.9rem] font-semibold text-[#555] dark:text-white">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#1a4a3a] dark:accent-[#5ecba1]"
                  />
                  Featured event
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
              <div>
                {id && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading || deleting}
                    className={deleteButtonClassName}
                  >
                    {deleting ? 'Deleting...' : 'Delete Event'}
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className={secondaryButtonClassName}
                  disabled={loading || deleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || deleting}
                  className={primaryButtonClassName}
                >
                  {loading ? 'Saving...' : id ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </div>
          </form>
        </section>
      </article>
    </main>
  )
}

export default AddEditEvent