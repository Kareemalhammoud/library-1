import React, { useState } from 'react'

const fieldClassName =
  'mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#006751] focus:ring-2 focus:ring-[#006751]/15 dark:border-[#333] dark:bg-[#2e2e2e] dark:text-white dark:placeholder:text-[#666] dark:focus:border-[#5ecba1] dark:focus:ring-[#5ecba1]/20'

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
            className="text-sm font-medium text-gray-700 dark:text-white"
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
            className="text-sm font-medium text-gray-700 dark:text-white"
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
            className="text-sm font-medium text-gray-700 dark:text-white"
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
            className="text-sm font-medium text-gray-700 dark:text-white"
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
            className="text-sm font-medium text-gray-700 dark:text-white"
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
            className="text-sm font-medium text-gray-700 dark:text-white"
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
          className="text-sm font-medium text-gray-700 dark:text-white"
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
          className="rounded-xl bg-[#1a6644] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#14533a] focus:outline-none focus:ring-2 focus:ring-[#1a6644]/25 dark:hover:bg-[#14533a]"
        >
          Save
        </button>
      </div>
    </form>
  )
}

export default BookForm
