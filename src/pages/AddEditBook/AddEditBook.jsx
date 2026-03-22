import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BOOKS } from '@/data/bookData'
import { useBooks } from '@/context/BooksContext'
import { getCampus, getCopies } from '@/utils/bookUtils'
import { isAdminUser } from '@/utils'

const emptyForm = {
  id: null,
  title: '',
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
  coverPageAvailable: null,
}

const labelClassName =
  'text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#aaa] dark:text-[#888]'
const fieldClassName =
  'mt-2 box-border w-full rounded-lg border border-[#e0ddd8] bg-[#f8f7f4] px-4 py-[0.85rem] text-[0.9rem] text-[#1a1a1a] outline-none transition-colors placeholder:text-[#a7a7a7] focus:border-[#1a1a1a] focus:bg-white dark:border-[#333] dark:bg-[#2e2e2e] dark:text-white dark:placeholder:text-[#666] dark:focus:border-[#5ecba1] dark:focus:bg-[#2e2e2e]'
const primaryButtonClassName =
  'cursor-pointer rounded-lg border-0 bg-[#1a4a3a] px-6 py-[0.85rem] text-[0.9rem] font-semibold text-white transition-colors hover:bg-[#2d7a4f]'
const secondaryButtonClassName =
  'cursor-pointer rounded-lg border border-[#ccc] bg-white px-6 py-[0.85rem] text-[0.9rem] font-semibold text-[#555] transition-colors hover:bg-[#f0f0f0] dark:border-[#333] dark:bg-[#2e2e2e] dark:text-[#888] dark:hover:bg-[#333]'

const AddEditBook = ({ books = [], onAddBook, onUpdateBook }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const booksContext = useBooks()

  const contextBooks = booksContext?.books ?? []
  const addBook = booksContext?.addBook
  const availableBooks = books.length > 0 ? books : contextBooks
  const admin = isAdminUser()

  const [formData, setFormData] = useState(emptyForm)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    if (!id) {
      setFormData(emptyForm)
      setImagePreview('')
      return
    }

    let existingBook = availableBooks.find((book) => String(book.id) === String(id))

    if (!existingBook) {
      existingBook = BOOKS.find((book) => String(book.id) === String(id))
    }

    if (!existingBook) {
      setFormData(emptyForm)
      setImagePreview('')
      return
    }

    const copyData = getCopies(existingBook.id)
    const resolvedCampus =
      existingBook.campus && existingBook.campus !== 'both'
        ? existingBook.campus
        : getCampus(existingBook.id) === 'both'
          ? ''
          : getCampus(existingBook.id) || ''
    const existingImage = existingBook.coverImage || existingBook.cover || ''

    setFormData({
      id: existingBook.id ?? null,
      title: existingBook.title || '',
      publisher: existingBook.publisher || existingBook.author || '',
      genre: existingBook.genre || '',
      isbn: existingBook.isbn || '',
      year: existingBook.year || '',
      copies:
        existingBook.copies !== undefined &&
        existingBook.copies !== null &&
        existingBook.copies !== ''
          ? existingBook.copies
          : copyData?.total ?? '',
      pages: existingBook.pages || '',
      rating: existingBook.rating || '',
      campus: resolvedCampus,
      language:
        existingBook.language === 'FR'
          ? 'French'
          : existingBook.language === 'EN'
            ? 'English'
            : existingBook.language || '',
      description: existingBook.description || '',
      coverImage: existingImage,
      coverPageAvailable:
        typeof existingBook.coverPageAvailable === 'boolean'
          ? existingBook.coverPageAvailable
          : Boolean(existingImage),
    })

    setImagePreview(existingImage)
  }, [availableBooks, id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const imageUrl = URL.createObjectURL(file)
    setImagePreview(imageUrl)
    setFormData((prevData) => ({
      ...prevData,
      coverImage: imageUrl,
      coverPageAvailable: true,
    }))
  }

  const handleRemoveImage = () => {
    setImagePreview('')
    setFormData((prevData) => ({
      ...prevData,
      coverImage: '',
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

  const handleSubmit = (e) => {
    e.preventDefault()

    const finalData = {
      ...formData,
      language:
        formData.language === 'French'
          ? 'FR'
          : formData.language === 'English'
            ? 'EN'
            : formData.language,
      pages: formData.pages ? Number(formData.pages) : '',
      rating: formData.rating ? Number(formData.rating) : '',
      copies: formData.copies ? Number(formData.copies) : '',
      year: formData.year ? Number(formData.year) : '',
    }

    if (id) {
      onUpdateBook?.(finalData)
    } else if (onAddBook) {
      onAddBook(finalData)
    } else {
      addBook?.(finalData)
    }

    navigate('/books')
  }

  const pageTitle = id ? 'Edit Book' : 'Add Book'
  const pageDescription = id
    ? 'Update the catalog entry while keeping the library styling aligned with the rest of the collection.'
    : 'Create a new catalog entry using the same warm neutral theme used across the library pages.'
  const breadcrumbTitle = formData.title || pageTitle

  if (!admin) {
    return <Navigate to="/books" replace />
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] pb-16 dark:bg-[#1a1a1a]">
      <nav
        className="flex items-center gap-4 border-b border-[#e5e2dc] bg-[#f8f7f4] px-8 py-4 dark:border-[#333] dark:bg-[#1a1a1a]"
        aria-label="Breadcrumb"
      >
        <button
          type="button"
          className="cursor-pointer rounded-md border border-[#ccc] bg-transparent px-[0.9rem] py-[0.4rem] text-[0.85rem] text-[#555] hover:bg-[#eee] dark:border-[#333] dark:text-[#888] dark:hover:bg-[#2e2e2e]"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <span className="text-[0.85rem] text-[#999] dark:text-[#888]">Books / {breadcrumbTitle}</span>
      </nav>

      <article className="mx-auto mt-12 max-w-[1000px] px-8">
        <section className="rounded-xl border border-[#e5e2dc] bg-white p-6 dark:border-[#333] dark:bg-[#242424] sm:p-8">
          <div className="border-b border-[#e5e2dc] pb-6 dark:border-[#333]">
            <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#aaa] dark:text-[#888]">
              Riyad Nassar Library
            </p>
            <h1 className="m-0 text-[2rem] font-extrabold tracking-tight text-[#1a1a1a] dark:text-white">
              {pageTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-[0.95rem] leading-[1.7] text-[#555] dark:text-[#888]">
              {pageDescription}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="title" className={labelClassName}>Title</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
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
                  value={formData.publisher}
                  onChange={handleChange}
                  required
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="genre" className={labelClassName}>Genre</label>
                <input
                  id="genre"
                  name="genre"
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
                  required
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
                  <option value="Jbeil">Jbeil</option>
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

                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full min-h-[220px] w-full max-w-[180px] rounded-md border border-[#e5e2dc] object-cover shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:border-[#333]"
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

              <div>
                <p className={labelClassName}>Cover Page Available?</p>
                <div className="mt-4 flex flex-wrap gap-6 text-[0.9rem] font-semibold text-[#555] dark:text-white">
                  <label className="inline-flex items-center gap-3">
                    <input
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
                  <div className="mt-5">
                    <label
                      htmlFor="cover-upload"
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#e0ddd8] bg-[#f8f7f4] px-6 py-6 text-center transition-colors hover:border-[#1a1a1a] hover:bg-white dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:hover:border-[#aaa] dark:hover:bg-[#333]"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1a4a3a] text-base font-medium text-white">
                        +
                      </span>
                      <span className="text-[0.92rem] font-semibold text-[#1a1a1a] dark:text-[#f0ede8]">
                        Upload cover image
                      </span>
                      <span className="text-[0.8rem] text-[#999] dark:text-[#666]">
                        Choose an image file to preview the book cover.
                      </span>
                    </label>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={secondaryButtonClassName}
              >
                Cancel
              </button>
              <button type="submit" className={primaryButtonClassName}>
                {id ? 'Update Book' : 'Save Book'}
              </button>
            </div>
          </form>
        </section>
      </article>
    </div>
  )
}

export default AddEditBook
