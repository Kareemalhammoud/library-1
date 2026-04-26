import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createBook, deleteBook, getBook, updateBook } from '@/utils/api'

const PLACEHOLDER_COVER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <rect width="300" height="450" fill="#f5f2ed"/>
  <rect x="16" y="16" width="268" height="418" rx="18" fill="none" stroke="#d9d3cb" stroke-width="2"/>
  <text x="150" y="180" font-family="Arial, sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#2f2f2f">NO</text>
  <text x="150" y="235" font-family="Arial, sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#2f2f2f">COVER</text>
  <text x="150" y="290" font-family="Arial, sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#2f2f2f">PAGE</text>
</svg>
`)}`

const emptyForm = {
  id: null,
  title: '',
  author: '',
  authorBiography: '',
  publisher: '',
  genre: '',
  isbn: '',
  year: '',
  copies: '',
  pages: '',
  rating: '',
  campus: '',
  language: '',
  description: '',
  coverImage: '',
  coverPageAvailable: false,
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

function sanitizeImage(url) {
  if (!url || typeof url !== 'string') return ''
  if (url.startsWith('blob:')) return ''
  return url.trim()
}

const AddEditBook = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState(emptyForm)
  const [imagePreview, setImagePreview] = useState('')
  const [showAuthorBioEditor, setShowAuthorBioEditor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setFormData(emptyForm)
        setImagePreview('')
        setShowAuthorBioEditor(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const data = await getBook(id)

        const safeImage = sanitizeImage(data.cover || data.image)

        setFormData({
          id: data.id ?? null,
          title: data.title || '',
          author: data.author || '',
          authorBiography: data.authorBiography || '',
          publisher: data.publisher || '',
          genre: data.genre || data.category || '',
          isbn: data.isbn || '',
          year: data.year ?? '',
          copies: data.copies ?? data.available_copies ?? data.availableCopies ?? '',
          pages: data.pages ?? '',
          rating: data.rating ?? '',
          campus: data.campus || '',
          language: data.language || '',
          description: data.description || '',
          coverImage: safeImage,
          coverPageAvailable: Boolean(safeImage),
        })

        setImagePreview(safeImage)
        setShowAuthorBioEditor(Boolean(data.authorBiography))
      } catch (err) {
        setError(
          err.status === 404
            ? 'Book not found'
            : err.message || 'Failed to load book'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleImageUrlChange = (e) => {
    const value = e.target.value

    setFormData((prevData) => ({
      ...prevData,
      coverImage: value,
      coverPageAvailable: Boolean(value.trim()),
    }))

    setImagePreview(value.trim())
  }

  const handleRemoveImage = () => {
    setImagePreview('')
    setFormData((prevData) => ({
      ...prevData,
      coverImage: '',
      coverPageAvailable: false,
    }))
  }

  const handleRadioChange = (e) => {
    const isAvailable = e.target.value === 'yes'

    setFormData((prevData) => ({
      ...prevData,
      coverPageAvailable: isAvailable,
      coverImage: isAvailable ? prevData.coverImage : '',
    }))

    if (!isAvailable) {
      setImagePreview('')
    }
  }

  const handleToggleBiography = () => {
    setShowAuthorBioEditor((prev) => !prev)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const payload = {
        title: formData.title,
        author: formData.author,
        publisher: formData.publisher,
        genre: formData.genre,
        category: formData.genre,
        isbn: formData.isbn,
        year: formData.year === '' ? null : Number(formData.year),
        pages: formData.pages === '' ? null : Number(formData.pages),
        rating: formData.rating === '' ? null : Number(formData.rating),
        campus: formData.campus,
        language: formData.language,
        description: formData.description,
        authorBiography: formData.authorBiography,
        cover: sanitizeImage(formData.coverImage),
        image: sanitizeImage(formData.coverImage),
        availableCopies: formData.copies === '' ? 1 : Number(formData.copies),
      }

      if (id) {
        await updateBook(id, payload)
      } else {
        await createBook(payload)
      }

      setSuccess(id ? 'Book updated successfully' : 'Book created successfully')

      setTimeout(() => {
        navigate('/books')
      }, 1000)
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.setItem('isLoggedIn', 'false')
        setError('Your session expired. Please log in again.')
        return
      }

      if (err.status === 400) {
        setError(err.message || 'Please check the book details and try again.')
        return
      }

      if (err.status === 403) {
        setError(err.message || 'You are not allowed to create or edit this book.')
        return
      }

      if (err.status === 500) {
        setError(
          `${err.message || 'Server error while saving the book.'} If you are testing the deployed site, redeploy the backend service too.`
        )
        return
      }

      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this book? This action cannot be undone.'
    )

    if (!confirmed) return

    try {
      setDeleting(true)
      setError('')
      setSuccess('')

      await deleteBook(id)

      setSuccess('Book deleted successfully')

      setTimeout(() => {
        navigate('/books')
      }, 800)
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.setItem('isLoggedIn', 'false')
        setError('Your session expired. Please log in again.')
        return
      }

      setError(err.message || 'Something went wrong while deleting')
    } finally {
      setDeleting(false)
    }
  }

  const pageTitle = id ? 'Edit Book' : 'Add New Book'
  const pageDescription = id
    ? 'Update the catalog entry while keeping the library styling aligned with the rest of the collection.'
    : 'Create a new catalog entry using the same library form layout and controls.'

  const breadcrumbTitle = formData.title || pageTitle

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
          Books / {breadcrumbTitle}
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
            <p className="mt-3 max-w-2xl text-[0.95rem] leading-[1.7] text-[#555] dark:text-[#888]">
              {pageDescription}
            </p>
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
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  className={fieldClassName}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="author" className={labelClassName}>Author</label>
                  <button
                    type="button"
                    onClick={handleToggleBiography}
                    className="rounded-md border border-[#d8d4cd] bg-white px-3 py-1 text-[0.72rem] font-semibold text-[#555] transition-colors hover:bg-[#f3f1ed] dark:border-[#333] dark:bg-[#2e2e2e] dark:text-[#bbb] dark:hover:bg-[#383838]"
                  >
                    {showAuthorBioEditor ? 'Hide Biography' : 'Add / Edit Biography'}
                  </button>
                </div>
                <input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="publisher" className={labelClassName}>Publisher</label>
                <input
                  id="publisher"
                  name="publisher"
                  type="text"
                  value={formData.publisher}
                  onChange={handleChange}
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="genre" className={labelClassName}>Genre</label>
                <input
                  id="genre"
                  name="genre"
                  type="text"
                  value={formData.genre}
                  onChange={handleChange}
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="isbn" className={labelClassName}>ISBN</label>
                <input
                  id="isbn"
                  name="isbn"
                  type="text"
                  value={formData.isbn}
                  onChange={handleChange}
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="year" className={labelClassName}>Year</label>
                <input
                  id="year"
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="copies" className={labelClassName}>Copies</label>
                <input
                  id="copies"
                  type="number"
                  name="copies"
                  value={formData.copies}
                  onChange={handleChange}
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="pages" className={labelClassName}>Pages</label>
                <input
                  id="pages"
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="rating" className={labelClassName}>Rating</label>
                <input
                  id="rating"
                  type="number"
                  name="rating"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="campus" className={labelClassName}>Campus</label>
                <select
                  id="campus"
                  name="campus"
                  value={formData.campus}
                  onChange={handleChange}
                  className={fieldClassName}
                >
                  <option value="">Select campus</option>
                  <option value="Beirut">Beirut</option>
                  <option value="Byblos">Byblos</option>
                </select>
              </div>

              <div>
                <label htmlFor="language" className={labelClassName}>Language</label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className={fieldClassName}
                >
                  <option value="">Select language</option>
                  <option value="English">English</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>

            {showAuthorBioEditor && (
              <div className="rounded-xl border border-[#e5e2dc] bg-[#faf9f6] p-4 dark:border-[#333] dark:bg-[#1f1f1f]">
                <label htmlFor="authorBiography" className={labelClassName}>
                  Author Biography
                </label>
                <textarea
                  id="authorBiography"
                  name="authorBiography"
                  value={formData.authorBiography}
                  onChange={handleChange}
                  rows="6"
                  className={`${fieldClassName} resize-y`}
                />
              </div>
            )}

            <div>
              <label htmlFor="description" className={labelClassName}>Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className={`${fieldClassName} resize-y`}
              />
            </div>

            <div className="grid items-start gap-6 border-t border-[#e5e2dc] pt-6 dark:border-[#333] sm:grid-cols-[220px_minmax(0,1fr)]">
              <div className="flex h-full flex-col items-center">
                <p className="m-0 mb-3 w-full text-center text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#aaa] dark:text-[#888]">
                  Cover Preview
                </p>

                {formData.coverPageAvailable ? (
                  <>
                    <img
                      src={imagePreview || PLACEHOLDER_COVER}
                      alt={formData.title ? `Cover preview for ${formData.title}` : 'Book cover preview'}
                      className="h-full min-h-[220px] w-full max-w-[180px] rounded-md border border-[#e5e2dc] object-cover shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:border-[#333]"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = PLACEHOLDER_COVER
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-3 text-center text-[0.8rem] font-semibold text-[#555] underline underline-offset-2 transition-colors hover:text-[#1a1a1a] dark:text-[#888] dark:hover:text-white"
                    >
                      Remove image
                    </button>
                  </>
                ) : (
                  <p className="m-0 text-center text-[0.82rem] leading-[1.5] text-[#999] dark:text-[#888]">
                    No cover yet.
                  </p>
                )}
              </div>

              <fieldset>
                <legend className={labelClassName}>Cover Page Available?</legend>
                <div className="mt-4 flex flex-wrap gap-6 text-[0.9rem] font-semibold text-[#555] dark:text-white">
                  <label className="inline-flex items-center gap-3">
                    <input
                      name="coverPageAvailable"
                      type="radio"
                      value="yes"
                      checked={formData.coverPageAvailable === true}
                      onChange={handleRadioChange}
                      className="h-4 w-4 accent-[#1a4a3a] dark:accent-[#5ecba1]"
                    />
                    Yes
                  </label>
                  <label className="inline-flex items-center gap-3">
                    <input
                      name="coverPageAvailable"
                      type="radio"
                      value="no"
                      checked={formData.coverPageAvailable === false}
                      onChange={handleRadioChange}
                      className="h-4 w-4 accent-[#1a4a3a] dark:accent-[#5ecba1]"
                    />
                    No
                  </label>
                </div>

                {formData.coverPageAvailable && (
                  <div className="mt-5 space-y-3">
                    <div>
                      <label htmlFor="coverImage" className={labelClassName}>
                        Cover Image URL
                      </label>
                      <input
                        id="coverImage"
                        name="coverImage"
                        type="text"
                        value={formData.coverImage}
                        onChange={handleImageUrlChange}
                        className={fieldClassName}
                        placeholder="https://example.com/book-cover.jpg"
                      />
                    </div>
                    <p className="text-[0.78rem] text-[#888] dark:text-[#888]">
                      Paste a direct image URL.
                    </p>
                  </div>
                )}
              </fieldset>
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
                    {deleting ? 'Deleting...' : 'Delete Book'}
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
                  {loading ? 'Saving...' : id ? 'Update Book' : 'Save Book'}
                </button>
              </div>
            </div>
          </form>
        </section>
      </article>
    </main>
  )
}

export default AddEditBook
