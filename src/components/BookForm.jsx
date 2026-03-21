import React, { useState } from 'react'

const fieldClassName =
  'mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#006751] focus:ring-2 focus:ring-[#006751]/15 dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-[#f0ede8] dark:placeholder:text-[#666] dark:focus:border-[#2d7a4f] dark:focus:ring-[#2d7a4f]/20'

const BookForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    year: '',
    copies: '',
    description: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="title"
            className="text-sm font-medium text-gray-700 dark:text-[#d0cdc8]"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={fieldClassName}
            placeholder="Enter book title"
          />
        </div>

        <div>
          <label
            htmlFor="author"
            className="text-sm font-medium text-gray-700 dark:text-[#d0cdc8]"
          >
            Author
          </label>
          <input
            id="author"
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className={fieldClassName}
            placeholder="Enter author name"
          />
        </div>

        <div>
          <label
            htmlFor="genre"
            className="text-sm font-medium text-gray-700 dark:text-[#d0cdc8]"
          >
            Genre
          </label>
          <input
            id="genre"
            type="text"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className={fieldClassName}
            placeholder="Enter genre"
          />
        </div>

        <div>
          <label
            htmlFor="isbn"
            className="text-sm font-medium text-gray-700 dark:text-[#d0cdc8]"
          >
            ISBN
          </label>
          <input
            id="isbn"
            type="text"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            className={fieldClassName}
            placeholder="Enter ISBN"
          />
        </div>

        <div>
          <label
            htmlFor="year"
            className="text-sm font-medium text-gray-700 dark:text-[#d0cdc8]"
          >
            Publication Year
          </label>
          <input
            id="year"
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className={fieldClassName}
            placeholder="Enter year"
          />
        </div>

        <div>
          <label
            htmlFor="copies"
            className="text-sm font-medium text-gray-700 dark:text-[#d0cdc8]"
          >
            Number of Copies
          </label>
          <input
            id="copies"
            type="number"
            name="copies"
            value={formData.copies}
            onChange={handleChange}
            className={fieldClassName}
            placeholder="Enter available copies"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="text-sm font-medium text-gray-700 dark:text-[#d0cdc8]"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          className={`${fieldClassName} resize-y`}
          placeholder="Write a short description"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-[#006751] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#005040] focus:outline-none focus:ring-2 focus:ring-[#006751]/25 dark:hover:bg-[#0b5b46]"
        >
          Save
        </button>
      </div>
    </form>
  )
}

export default BookForm
