import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { BOOKS } from '@/data/bookData'
import { fetchBooks, isBackendConfigured } from '@/services/libraryApi'

const BooksContext = createContext()

export function BooksProvider({ children }) {
  const [books, setBooks] = useState(BOOKS)
  const [loading, setLoading] = useState(isBackendConfigured())
  const [error, setError] = useState('')
  const loadIdRef = useRef(0)

  const loadBooks = useCallback(async (params = {}) => {
    if (!isBackendConfigured()) {
      setBooks(BOOKS)
      setLoading(false)
      setError('')
      return BOOKS
    }

    const loadId = loadIdRef.current + 1
    loadIdRef.current = loadId

    setLoading(true)
    setError('')

    try {
      const nextBooks = await fetchBooks(params)
      if (loadId === loadIdRef.current) {
        setBooks(nextBooks.length ? nextBooks : BOOKS)
      }
      return nextBooks
    } catch (err) {
      if (loadId === loadIdRef.current) {
        setBooks(BOOKS)
        setError(err.message || 'Could not load books from the server.')
      }
      return BOOKS
    } finally {
      if (loadId === loadIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    Object.keys(localStorage)
      .filter((key) => (
        key.endsWith('borrowed-undefined') ||
        key.endsWith('reserved-undefined') ||
        key.endsWith('loan-undefined') ||
        key.endsWith('reading-progress-undefined')
      ))
      .forEach((key) => localStorage.removeItem(key))
    loadBooks()
  }, [loadBooks])

  function addBook(data) {
    const newBook = {
      ...data,
      id: Date.now(),
      color: 'slate',
      genreColor: '#5C7098',
      language: 'EN',
      year: new Date().getFullYear(),
      pages: 0,
      publisher: '',
      isbn: '',
      rating: 0,
      description: '',
      cover: '',
    }
    setBooks(prev => [...prev, newBook])
  }

  return (
    <BooksContext.Provider value={{ books, addBook, error, loading, loadBooks }}>
      {children}
    </BooksContext.Provider>
  )
}

BooksProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBooks() {
  return useContext(BooksContext)
}
