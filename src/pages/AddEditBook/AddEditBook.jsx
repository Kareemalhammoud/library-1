import BookForm from '../../components/BookForm';
import { useBooks } from '@/context/BooksContext'
import { useNavigate } from 'react-router-dom'

const AddEditBook = () => {
  const { addBook } = useBooks()
  const navigate = useNavigate()

  const handleSubmit = (data) => {
    addBook(data)
    navigate('/books')
  }

  return (
    <div className="mx-auto mt-10 max-w-5xl px-4 pb-14 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#006751] dark:text-[#2d7a4f]">
          Library Catalog
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-800 dark:text-[#f0ede8]">
          Add / Edit Book
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-[#999]">
          Add a new title or update book information while keeping the catalog
          aligned with the rest of the library theme.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md dark:border-[#2e2e2e] dark:bg-[#222] sm:p-8">
      <BookForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}

export default AddEditBook
