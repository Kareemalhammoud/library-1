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

	const getLoanDetails = (bookId) => {
		const rawLoan = localStorage.getItem(`loan-${bookId}`)

		if (!rawLoan) return null

		try {
			return JSON.parse(rawLoan)
		} catch {
			return null
		}
	}

	useEffect(() => {

		const savedUser = JSON.parse(localStorage.getItem("user"))
		const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

		if (!savedUser || !isLoggedIn) {
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
				const parsedBorrowedBooks = JSON.parse(savedBorrowedBooks).map((book) => {
					const loanDetails = getLoanDetails(book.id)

					return {
						...book,
						borrowedAt: book.borrowedAt || loanDetails?.borrowedAt || null
					}
				})

				setBorrowedBooks(parsedBorrowedBooks)
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
					borrowedAt: loan.borrowedAt || null,
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
						borrowedAt: book.borrowedAt || parsedLoan.borrowedAt,
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
						borrowedAt: book.borrowedAt || null,
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

	const handleLogout = () => {
		localStorage.setItem("isLoggedIn", "false")
		navigate("/login")
	}

	const formatLoanDate = (date) => {
		if (!date) return "N/A"
		return new Date(date).toLocaleDateString()
	}

	if (!user) return null

	return (

		<div className="max-w-5xl mx-auto mt-10 px-4 sm:px-6">

			<div className="mb-6 flex items-center justify-between gap-4">
				<h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
					User Account
				</h1>

				<button
					type="button"
					className="rounded-md bg-[#1a6644] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#14533a] dark:bg-[#1a6644] dark:text-white dark:hover:bg-[#14533a]"
					onClick={handleLogout}
				>
					Logout
				</button>
			</div>

			<div className="flex flex-col md:flex-row justify-between gap-8 bg-white p-6 rounded-xl shadow-md border border-gray-200 dark:bg-[#242424] dark:border-[#333]">

				<div className="flex-1 space-y-4">

					<h2 className="text-xl font-semibold text-gray-700 dark:text-white">
						Profile Information
					</h2>

					<div className="flex items-center gap-3 flex-wrap">

						<span className="font-medium text-gray-700 dark:text-white">Username:</span>

						{editingUsername ? (
							<>
								<input
									className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:border-[#006751] focus:ring-2 focus:ring-[#006751]/20 dark:bg-[#2e2e2e] dark:border-[#333] dark:text-white"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									aria-label="Edit username"
								/>

								<button
									className="bg-[#1a6644] text-white px-4 py-2 rounded-md hover:bg-[#14533a] transition"
									onClick={handleUsernameUpdate}
									aria-label="Save username"
								>
									Save
								</button>
							</>
						) : (
							<>
								<span className="text-gray-600 dark:text-[#888]">{user.username}</span>

								<button
									className="text-[#006751] underline cursor-pointer text-sm dark:text-[#5ecba1] dark:hover:text-white"
									onClick={() => setEditingUsername(true)}
									aria-label="Change username"
								>
									Change Username
								</button>
							</>
						)}

					</div>

					<p>
						<span className="font-medium text-gray-700 dark:text-white">Email:</span>
						<span className="text-gray-600 ml-2 dark:text-[#888]">{user.email}</span>
					</p>

					<p>
						<span className="font-medium text-gray-700 dark:text-white">Date Joined:</span>
						<span className="text-gray-600 ml-2 dark:text-[#888]">
							{user.createdAt
								? new Date(user.createdAt).toLocaleDateString()
								: "N/A"}
						</span>
					</p>

					<p>
						<span className="font-medium text-gray-700 dark:text-white">Account Status:</span>
						<span className="ml-2 text-[#006751] dark:text-[#5ecba1]">Active</span>
					</p>

				</div>

				<div className="flex flex-col items-center gap-3">

					<img
						src={profilePic}
						alt={`${user.username}'s profile picture`}
						className="w-36 h-36 rounded-full object-cover border-2 border-gray-200 shadow-sm dark:border-[#333]"
					/>

					<button
						className="text-sm border border-transparent bg-[#1a6644] text-white px-4 py-2 rounded-md hover:bg-[#14533a] transition dark:border-[#333]"
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

			<div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200 dark:bg-[#242424] dark:border-[#333]">

				<h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">
					Library Activity
				</h2>

				<h3 className="font-medium text-gray-700 dark:text-white">Checked Out Books</h3>
				{borrowedBooks.length === 0 ? (
					<p className="text-gray-600 mb-4 dark:text-[#888]">No books checked out</p>
				) : (
					<ul className="mt-4 space-y-3">
						{borrowedBooks.map((book) => {
							const progress = Number(localStorage.getItem(`reading-progress-${book.id}`) ?? 0)
							const isRenewDisabled = book.renewCount >= 2 || book.isReserved === true
							const bookDetails = BOOKS.find((item) => item.id === book.id)

							return (
								<li key={book.id}>
									<div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm dark:border-[#333] dark:bg-[#242424] dark:text-white sm:flex-row sm:items-center sm:justify-between">
										<div className="flex min-w-0 items-center gap-4">
											<button
												type="button"
												className="w-[52px] flex-shrink-0 cursor-pointer border-0 bg-transparent p-0 text-left"
												onClick={() => navigate(`/books/${book.id}`)}
											>
												<img
													src={bookDetails?.cover}
													alt={`Cover of ${book.title}`}
													className="aspect-[2/3] w-full rounded-md object-cover shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
												/>
											</button>

											<div className="min-w-0">
												<button
													type="button"
													className="cursor-pointer border-0 bg-transparent p-0 text-left"
													onClick={() => navigate(`/books/${book.id}`)}
												>
													<p className="truncate text-left text-lg font-semibold text-gray-800 dark:text-white">
														{book.title}
													</p>
												</button>
												<p className="text-sm text-gray-600 dark:text-[#888]">{bookDetails?.author || "Unknown author"}</p>
												<p className="mt-1 text-sm text-gray-500 dark:text-[#888]">
													Borrowed {formatLoanDate(book.borrowedAt)} · Due {formatLoanDate(book.dueDate)}
												</p>
											</div>
										</div>

										<div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[320px]">
											<div className="flex items-center gap-3">
												<div className="min-w-0 flex-1">
													<div className="mb-1 flex items-center justify-between">
														<span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-gray-500 dark:text-[#888]">
															Progress
														</span>
														<span className="text-[0.8rem] font-semibold text-gray-800 dark:text-white">
															{progress}%
														</span>
													</div>

													<div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-[#f0ede8] dark:bg-[#2e2e2e]">
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
														className="m-0 h-1 w-full cursor-pointer appearance-none bg-transparent outline-none accent-[#1a4a3a] dark:accent-[#5ecba1] [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[2px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#1a4a3a] dark:[&::-moz-range-thumb]:border-[#1a1a1a] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[2px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#1a4a3a] [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#ccc,0_2px_6px_rgba(0,0,0,0.2)] hover:[&::-webkit-slider-thumb]:scale-[1.15] hover:[&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#999,0_4px_10px_rgba(0,0,0,0.25)] dark:[&::-webkit-slider-thumb]:border-[#1a1a1a]"
														aria-label={`Reading progress for ${book.title}`}
													/>
												</div>

												<button
													type="button"
													className="rounded-md bg-[#1a6644] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#14533a] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:bg-[#1a6644] dark:text-white dark:hover:bg-[#14533a] dark:disabled:bg-[#333] dark:disabled:text-[#888]"
													onClick={() => handleRenewBook(book.id)}
													disabled={isRenewDisabled}
												>
													{isRenewDisabled ? "Renewed Max" : "Renew"}
												</button>
											</div>
										</div>
									</div>
								</li>
							)
						})}
					</ul>
				)}

				<h3 className="mt-8 font-medium text-gray-700 dark:text-white">Overdue Books & Fines</h3>
				{overdueBooks.length === 0 ? (
					<p className="text-gray-600 dark:text-[#888]">No overdue books</p>
				) : (
					<ul className="list-disc ml-6 text-gray-600 dark:text-[#888]">
						{overdueBooks.map((book) => (
							<li key={book.id}>
								{book.title} - Due on {new Date(book.dueDate).toLocaleDateString()}
							</li>
						))}
					</ul>
				)}

			</div>

			<div className="mt-8 mb-10 flex flex-wrap gap-4">

				<button
					className="bg-[#1a6644] text-white px-5 py-2 rounded-md hover:bg-[#14533a] transition"
					onClick={() => navigate("/books")}
				>
					Search Books
				</button>

			</div>

		</div>
	)
}

export default Dashboard
