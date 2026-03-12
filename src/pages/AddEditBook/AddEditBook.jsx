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
    <div>
      <h1>Add/Edit Book</h1>
      <BookForm onSubmit={handleSubmit} />
    </div>
  )
}

export default AddEditBook