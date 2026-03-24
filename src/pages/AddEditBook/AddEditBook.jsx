import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BOOKS } from '@/data/bookData'
import { useBooks } from '@/context/BooksContext'
import { getCampus, getCopies } from '@/utils/bookUtils'

const AUTHOR_BIOGRAPHIES = {
  'Donna Tartt':
    'An American novelist known for immersive literary fiction. She won the Pulitzer Prize for The Goldfinch, often exploring morality and obsession.',
  'Brandon Sanderson':
    'A leading modern fantasy author known for intricate magic systems and the Cosmere universe.',
  'Struan Murray':
    'A British children’s fantasy writer blending mythology and science in imaginative stories.',
  'Christopher Paolini':
    'American fantasy author who gained fame with Eragon, written as a teenager.',
  'Maria Zoccola':
    'A contemporary writer focusing on emotional narratives and character-driven stories.',
  'Ludwig Wittgenstein':
    'A major 20th-century philosopher focused on language, logic, and meaning.',
  'E. Lockhart':
    'American YA author known for psychological storytelling like We Were Liars.',
  'Tricia Levenseller':
    'YA fantasy author known for fast-paced, character-led adventures.',
  'Tahereh Mafi':
    'Bestselling author of the Shatter Me series, blending dystopia and lyrical prose.',
  'John Gwynne':
    'Epic fantasy writer inspired by Norse mythology and action-driven narratives.',
  'George Orwell':
    'Political writer known for 1984 and Animal Farm, exploring power and control.',
  'Fyodor Dostoevsky':
    'Russian novelist exploring psychology, morality, and existential themes.',
  'Franz Kafka':
    'Writer of surreal, existential works reflecting alienation and absurdity.',
  'Albert Camus':
    'Philosopher of absurdism exploring meaning and existence in works like The Stranger.',
  'J.K. Rowling':
    'Creator of Harry Potter, a globally influential fantasy series.',
  'J.R.R. Tolkien':
    'Father of modern fantasy, author of The Lord of the Rings.',
  'Jane Austen':
    'English novelist known for wit and social commentary.',
  'Colleen Hoover':
    'Contemporary romance author exploring emotional and personal themes.',
  'Leigh Bardugo':
    'Fantasy author known for the Grishaverse series.',
  'Rick Riordan':
    'Author blending mythology with modern adventure, like Percy Jackson.',
  'Stephen King':
    'Master of horror and suspense with a vast body of work.',
  'Agatha Christie':
    'Legendary mystery writer, creator of Hercule Poirot.',
  'Dan Brown':
    'Thriller author known for fast-paced conspiracy novels.',
  'Suzanne Collins':
    'Author of The Hunger Games, combining dystopia and social themes.',
  'Veronica Roth':
    'Known for Divergent, exploring identity and society.',
  'C.S. Lewis':
    'Author of The Chronicles of Narnia, blending fantasy and philosophy.',
  'Neil Gaiman':
    'Writer combining fantasy, mythology, and dark storytelling.',
  'Mark Manson':
    'Self-help author known for direct, modern perspectives on life.',
  'Robert Greene':
    'Author of strategic works on power and human behavior.',
  'Yuval Noah Harari':
    'Historian exploring humanity and the future in Sapiens.',
}

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
  coverPageAvailable: null,
}

const labelClassName =
  'text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#aaa] dark:text-[#888]'

const fieldClassName =
  'mt-2 box-border w-full rounded-lg border border-[#e0ddd8] bg-[#f8f7f4] px-4 py-[0.85rem] text-[0.9rem] text-[#1a1a1a] outline-none transition-colors placeholder:text-[#a7a7a7] focus:border-[#1a4a3a] focus:bg-white dark:border-[#333] dark:bg-[#2e2e2e] dark:text-white dark:placeholder:text-[#666] dark:focus:border-[#5ecba1] dark:focus:bg-[#2e2e2e]'

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
  const updateBook = booksContext?.updateBook
  const availableBooks = books.length > 0 ? books : contextBooks

  const [formData, setFormData] = useState(emptyForm)
  const [imagePreview, setImagePreview] = useState('')
  const [showAuthorBioEditor, setShowAuthorBioEditor] = useState(false)

  useEffect(() => {
    if (!id) {
      setFormData(emptyForm)
      setImagePreview('')
      setShowAuthorBioEditor(false)
      return
    }

    let existingBook = availableBooks.find((book) => String(book.id) === String(id))

    if (!existingBook) {
      existingBook = BOOKS.find((book) => String(book.id) === String(id))
    }

    if (!existingBook) {
      setFormData(emptyForm)
      setImagePreview('')
      setShowAuthorBioEditor(false)
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
    const resolvedBiography =
      existingBook.authorBiography ||
      AUTHOR_BIOGRAPHIES[existingBook.author] ||
      ''

    setFormData({
      id: existingBook.id ?? null,
      title: existingBook.title || '',
      author: existingBook.author || '',
      authorBiography: resolvedBiography,
      publisher: existingBook.publisher || '',
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
    setShowAuthorBioEditor(Boolean(resolvedBiography))
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

  const handleToggleBiography = () => {
    setShowAuthorBioEditor((prev) => !prev)
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
      if (onUpdateBook) {
        onUpdateBook(finalData)
      } else {
        updateBook?.(finalData)
      }
    } else {
      if (onAddBook) {
        onAddBook(finalData)
      } else {
        addBook?.(finalData)
      }
    }

    navigate('/books')
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
                  required
                  autoComplete="organization"
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
                  autoComplete="off"
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
                  autoComplete="off"
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
                  placeholder="Add or edit the author biography here..."
                  className={`${fieldClassName} resize-y`}
                />
                <p className="mt-2 text-[0.78rem] text-[#888] dark:text-[#888]">
                  This biography can be shown when users hover over the author name.
                </p>
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

                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt={formData.title ? `Cover preview for ${formData.title}` : 'Book cover preview'}
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
                  <div className="mt-5">
                    <label
                      htmlFor="cover-upload"
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#e0ddd8] bg-[#f8f7f4] px-6 py-6 text-center transition-colors hover:border-[#1a1a1a] hover:bg-white dark:border-[#333] dark:bg-[#2e2e2e] dark:hover:border-[#5ecba1] dark:hover:bg-[#333]"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1a4a3a] text-base font-medium text-white">
                        +
                      </span>
                      <span className="text-[0.92rem] font-semibold text-[#1a1a1a] dark:text-white">
                        Upload cover image
                      </span>
                      <span className="text-[0.8rem] text-[#999] dark:text-[#888]">
                        Choose an image file to preview the book cover.
                      </span>
                    </label>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                      aria-label="Upload a cover image"
                    />
                  </div>
                )}
              </fieldset>
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
    </main>
  )
}

export default AddEditBook