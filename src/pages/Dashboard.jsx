import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import defaultPic from "../assets/default-profile.png"
import { BOOKS } from "../data/bookData"

function Dashboard() {

	const navigate = useNavigate()
	const fileInputRef = useRef(null)

	const [user, setUser] = useState(null)
	const [username, setUsername] = useState("")
	const [profilePic, setProfilePic] = useState(defaultPic)
	const [editingUsername, setEditingUsername] = useState(false)
	const [borrowedBooks, setBorrowedBooks] = useState([])
	const [borrowedBooksLoaded, setBorrowedBooksLoaded] = useState(false)

	useEffect(() => {

		const savedUser = JSON.parse(localStorage.getItem("user"))

		if (!savedUser) {
			navigate("/login")
			return
		}

		setUser(savedUser)
		setUsername(savedUser.username)

		if (savedUser.profilePic) {
			setProfilePic(savedUser.profilePic)
		}

	}, [])

	useEffect(() => {

		const savedBorrowedBooks = localStorage.getItem("borrowedBooks")

		if (savedBorrowedBooks) {
			try {
				setBorrowedBooks(JSON.parse(savedBorrowedBooks))
				setBorrowedBooksLoaded(true)
				return
			} catch {
				// Fall through to rebuild from legacy keys.
			}
		}

		const rebuiltBorrowedBooks = BOOKS.map((book) => {

			const rawLoan = localStorage.getItem(`loan-${book.id}`)

			if (!rawLoan) return null

			try {
				const loan = JSON.parse(rawLoan)

				return {
					id: book.id,
					title: book.title,
					dueDate: loan.dueDate || loan.dueAt,
					renewCount: loan.renewCount ?? 0,
					isReserved: loan.isReserved ?? false
				}
			} catch {
				return null
			}
		}).filter(Boolean)

		setBorrowedBooks(rebuiltBorrowedBooks)
		setBorrowedBooksLoaded(true)

	}, [])

	useEffect(() => {

		if (!borrowedBooksLoaded) return

		localStorage.setItem("borrowedBooks", JSON.stringify(borrowedBooks))

		borrowedBooks.forEach((book) => {
			const legacyLoan = localStorage.getItem(`loan-${book.id}`)

			if (!legacyLoan) return

			try {
				const parsedLoan = JSON.parse(legacyLoan)
				localStorage.setItem(
					`loan-${book.id}`,
					JSON.stringify({
						...parsedLoan,
						dueAt: book.dueDate,
						dueDate: book.dueDate,
						renewCount: book.renewCount,
						isReserved: book.isReserved
					})
				)
			} catch {
				localStorage.setItem(
					`loan-${book.id}`,
					JSON.stringify({
						bookId: book.id,
						dueAt: book.dueDate,
						dueDate: book.dueDate,
						renewCount: book.renewCount,
						isReserved: book.isReserved
					})
				)
			}
		})

	}, [borrowedBooks, borrowedBooksLoaded])

	const overdueBooks = borrowedBooks.filter((book) => new Date(book.dueDate) < new Date())

	const handleUsernameUpdate = () => {

		const updatedUser = {
			...user,
			username: username
		}

		localStorage.setItem("user", JSON.stringify(updatedUser))
		setUser(updatedUser)
		setEditingUsername(false)
	}

	const handleProfileChange = (event) => {

		const file = event.target.files[0]
		if (!file) return

		const reader = new FileReader()

		reader.onloadend = () => {

			const updatedUser = {
				...user,
				profilePic: reader.result
			}

			localStorage.setItem("user", JSON.stringify(updatedUser))

			setUser(updatedUser)
			setProfilePic(reader.result)
		}

		reader.readAsDataURL(file)
	}

	const handleRenewBook = (bookId) => {

		setBorrowedBooks((currentBooks) =>
			currentBooks.map((book) => {

				if (book.id !== bookId) return book

				if (book.renewCount >= 2) {
					alert("Renewal limit reached")
					return book
				}

				if (book.isReserved === true) {
					alert("Cannot renew, book is reserved")
					return book
				}

				const nextDueDate = new Date(book.dueDate)
				nextDueDate.setDate(nextDueDate.getDate() + 7)

				return {
					...book,
					dueDate: nextDueDate.toISOString(),
					renewCount: book.renewCount + 1
				}
			})
		)
	}

	const handleLoanProgressChange = (bookId, value) => {

		localStorage.setItem(`reading-progress-${bookId}`, String(value))
		setBorrowedBooks((currentBooks) => [...currentBooks])
	}

	const openFilePicker = () => {
		fileInputRef.current.click()
	}

	if (!user) return null

	return (

		<div className="max-w-5xl mx-auto mt-10 px-4 sm:px-6">

			<h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-[#f0ede8]">
				User Account
			</h1>

			{/* Profile Section */}
			<div className="flex flex-col md:flex-row justify-between gap-8 bg-white p-6 rounded-xl shadow-md border border-gray-200 dark:bg-[#222] dark:border-[#2e2e2e]">

				{/* LEFT SIDE */}
				<div className="flex-1 space-y-4">

					<h2 className="text-xl font-semibold text-gray-700 dark:text-[#f0ede8]">
						Profile Information
					</h2>

					{/* Username Row */}
					<div className="flex items-center gap-3 flex-wrap">

						<span className="font-medium text-gray-700 dark:text-[#d0cdc8]">Username:</span>

						{editingUsername ? (
							<>
								<input
									className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:border-[#006751] focus:ring-2 focus:ring-[#006751]/20 dark:bg-[#2a2a2a] dark:border-[#3a3a3a] dark:text-[#f0ede8]"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									aria-label="Edit username"
								/>

								<button
									className="bg-[#006751] text-white px-4 py-2 rounded-md hover:bg-[#005040] transition"
									onClick={handleUsernameUpdate}
									aria-label="Save username"
								>
									Save
								</button>
							</>
						) : (
							<>
								<span className="text-gray-600 dark:text-[#999]">{user.username}</span>

								<button
									className="text-[#006751] underline cursor-pointer text-sm dark:text-[#00AB8E] dark:hover:text-[#2d7a4f]"
									onClick={() => setEditingUsername(true)}
									aria-label="Change username"
								>
									Change Username
								</button>
							</>
						)}

					</div>

					<p>
						<span className="font-medium text-gray-700 dark:text-[#d0cdc8]">Email:</span>
						<span className="text-gray-600 ml-2 dark:text-[#999]">{user.email}</span>
					</p>

					<p>
						<span className="font-medium text-gray-700 dark:text-[#d0cdc8]">Date Joined:</span>
						<span className="text-gray-600 ml-2 dark:text-[#999]">
							{user.createdAt
								? new Date(user.createdAt).toLocaleDateString()
								: "N/A"}
						</span>
					</p>

					<p>
						<span className="font-medium text-gray-700 dark:text-[#d0cdc8]">Account Status:</span>
						<span className="ml-2 text-[#006751] dark:text-[#00AB8E]">Active</span>
					</p>

				</div>

				{/* RIGHT SIDE (Profile Picture) */}
				<div className="flex flex-col items-center gap-3">

					<img
						src={profilePic}
						alt={`${user.username}'s profile picture`}
						className="w-36 h-36 rounded-full object-cover border-2 border-gray-200 shadow-sm dark:border-[#3a3a3a]"
					/>

					<button
						className="text-sm border border-transparent bg-[#006751] text-white px-4 py-2 rounded-md hover:bg-[#005040] transition dark:border-[#3a3a3a]"
						onClick={openFilePicker}
						aria-label="Upload new profile picture"
					>
						Edit Profile Picture
					</button>

					<input
						type="file"
						accept="image/*"
						ref={fileInputRef}
						onChange={handleProfileChange}
						className="hidden"
						aria-label="Choose profile picture"
					/>

				</div>

			</div>

			{/* Library Section */}
			<div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200 dark:bg-[#222] dark:border-[#2e2e2e]">

				<h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-[#f0ede8]">
					Library Activity
				</h2>

				<h3 className="font-medium text-gray-700 dark:text-[#d0cdc8]">Checked Out Books</h3>
				{borrowedBooks.length === 0 ? (
					<p className="text-gray-600 mb-4 dark:text-[#999]">No books checked out</p>
				) : (
					<ul className="list-disc ml-6 text-gray-600 mb-4 dark:text-[#999]">
						{borrowedBooks.map((book) => {
							const progress = Number(localStorage.getItem(`reading-progress-${book.id}`) ?? 0)
							const isRenewDisabled = book.renewCount >= 2 || book.isReserved === true
							const bookDetails = BOOKS.find((item) => item.id === book.id)

							return (
								<li key={book.id} className="mb-4">
									<div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2e2e2e] dark:bg-[#252525] sm:flex-row sm:items-start">
										<div className="w-full max-w-[110px]">
											<button
												type="button"
												className="cursor-pointer border-0 bg-transparent p-0 text-left"
												onClick={() => navigate(`/books/${book.id}`)}
											>
												<img
													src={bookDetails?.cover}
													alt={`Cover of ${book.title}`}
													className="aspect-[2/3] w-full rounded-md object-cover shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
												/>
											</button>
											<button
												type="button"
												className="mt-2 w-full cursor-pointer border-0 bg-transparent p-0 text-center font-semibold text-[#006751] underline hover:text-[#005040] dark:text-[#00AB8E] dark:hover:text-[#2d7a4f]"
												onClick={() => navigate(`/books/${book.id}`)}
											>
												{book.title}
											</button>
										</div>

										<div className="flex-1">
											<div className="mb-3 flex flex-wrap items-center gap-2 text-gray-600 dark:text-[#999]">
												<span>Return by {new Date(book.dueDate).toLocaleDateString()}</span>
												<span>Renewals {book.renewCount}/2</span>
												<button
													type="button"
													className="bg-[#006751] text-white px-3 py-1 rounded-md hover:bg-[#005040] transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-[#3a3a3a] dark:disabled:text-[#777]"
													onClick={() => handleRenewBook(book.id)}
													disabled={isRenewDisabled}
												>
													Renew
												</button>
											</div>

											<div className="max-w-[340px] rounded-lg border border-[#e5e2dc] bg-white px-3 py-2 dark:border-[#2e2e2e] dark:bg-[#222]">
												<div className="mb-2 flex items-center justify-between">
													<span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#aaa] dark:text-[#555]">
														Reading Progress
													</span>
													<span className="text-[0.85rem] font-semibold text-[#1a1a1a] dark:text-[#f0ede8]">
														{progress}%
													</span>
												</div>

												<div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-[#f0ede8] dark:bg-[#2a2a2a]">
													<div
														className="h-full rounded-full bg-gradient-to-r from-[#2d7a4f] to-[#1a4a3a] transition-[width] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
														style={{ width: `${progress}%` }}
													/>
												</div>

												<input
													type="range"
													min="0"
													max="100"
													value={progress}
													onChange={(e) => handleLoanProgressChange(book.id, Number(e.target.value))}
													className="m-0 h-2 w-full cursor-pointer appearance-none bg-transparent outline-none accent-[#1a4a3a] dark:accent-[#2d7a4f] [&::-moz-range-thumb]:h-[12px] [&::-moz-range-thumb]:w-[12px] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[2px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#1a4a3a] dark:[&::-moz-range-thumb]:border-[#1a1a1a] [&::-webkit-slider-thumb]:mt-[-2px] [&::-webkit-slider-thumb]:h-[12px] [&::-webkit-slider-thumb]:w-[12px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[2px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#1a4a3a] dark:[&::-webkit-slider-thumb]:border-[#1a1a1a]"
													aria-label={`Reading progress for ${book.title}`}
												/>
											</div>
										</div>
									</div>
								</li>
							)
						})}
					</ul>
				)}

				<h3 className="font-medium text-gray-700 dark:text-[#d0cdc8]">Reserved Books</h3>
				<ul className="list-disc ml-6 text-gray-600 mb-4 dark:text-[#999]">
					<li>No reserved books</li>
				</ul>

				<h3 className="font-medium text-gray-700 dark:text-[#d0cdc8]">Overdue Books & Fines</h3>
				{overdueBooks.length === 0 ? (
					<p className="text-gray-600 dark:text-[#999]">No overdue books</p>
				) : (
					<ul className="list-disc ml-6 text-gray-600 dark:text-[#999]">
						{overdueBooks.map((book) => (
							<li key={book.id}>
								{book.title} - Due on {new Date(book.dueDate).toLocaleDateString()}
							</li>
						))}
					</ul>
				)}

			</div>

			{/* Actions */}
			<div className="mt-8 flex flex-wrap gap-4">

				<button
					className="bg-[#006751] text-white px-5 py-2 rounded-md hover:bg-[#005040] transition"
					onClick={() => navigate("/books")}
				>
					Search Books
				</button>

			</div>

		</div>
	)
}

export default Dashboard
