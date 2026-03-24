import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import defaultPic from "../assets/default-profile.png"
import { BOOKS } from "../data/bookData"
import { EVENTS } from "../data/eventsData"
import { getStoredUser } from "../utils"

const CALENDAR_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const CALENDAR_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function buildUserPrefix() {
	const storedUser = getStoredUser()
	return storedUser?.email ? `${storedUser.email}:` : ""
}

function getRegisteredEvents(prefix) {
	const rawRegisteredEvents =
		localStorage.getItem(`${prefix}registeredEvents`) ||
		localStorage.getItem("registeredEvents")

	if (!rawRegisteredEvents) return []

	try {
		const parsed = JSON.parse(rawRegisteredEvents)
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

function Dashboard() {

	const navigate = useNavigate()

	const [user, setUser] = useState(null)
	const [username, setUsername] = useState("")
	const [profilePic, setProfilePic] = useState(defaultPic)
	const [editingUsername, setEditingUsername] = useState(false)
	const [borrowedBooks, setBorrowedBooks] = useState([])
	const [borrowedBooksLoaded, setBorrowedBooksLoaded] = useState(false)
	const [registeredEvents, setRegisteredEvents] = useState([])
	const [calendarViewDate, setCalendarViewDate] = useState(() => new Date())

	const getUserPrefix = () => {
		return buildUserPrefix()
	}

	const getLoanDetails = (bookId) => {
		const prefix = getUserPrefix()
		const rawLoan =
			localStorage.getItem(`${prefix}loan-${bookId}`) ||
			localStorage.getItem(`loan-${bookId}`)

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

		const prefix = getUserPrefix()
		setRegisteredEvents(getRegisteredEvents(prefix))

		const savedBorrowedBooks =
			localStorage.getItem(`${prefix}borrowedBooks`) ||
			localStorage.getItem("borrowedBooks")

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

			const rawLoan =
				localStorage.getItem(`${prefix}loan-${book.id}`) ||
				localStorage.getItem(`loan-${book.id}`)

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

		const prefix = getUserPrefix()
		localStorage.setItem(`${prefix}borrowedBooks`, JSON.stringify(borrowedBooks))

		borrowedBooks.forEach((book) => {
			const loanKey = `${prefix}loan-${book.id}`
			const legacyLoan =
				localStorage.getItem(loanKey) ||
				localStorage.getItem(`loan-${book.id}`)

			if (!legacyLoan) return

			try {
				const parsedLoan = JSON.parse(legacyLoan)
				localStorage.setItem(
					loanKey,
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
					loanKey,
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
	const calendarYear = calendarViewDate.getFullYear()
	const calendarMonth = calendarViewDate.getMonth()
	const monthStart = new Date(calendarYear, calendarMonth, 1)
	const monthEnd = new Date(calendarYear, calendarMonth + 1, 0)
	const calendarStartOffset = monthStart.getDay()
	const totalDaysInMonth = monthEnd.getDate()
	const registeredEventIds = new Set(registeredEvents.map((event) => event.id))
	const calendarEntriesByDay = {}

	// Merge event dates and book deadlines into one calendar view.
	EVENTS.forEach((event) => {
		const eventDate = new Date(`${event.date}T00:00:00`)
		if (eventDate.getFullYear() !== calendarYear || eventDate.getMonth() !== calendarMonth) return

		const day = eventDate.getDate()
		if (!calendarEntriesByDay[day]) calendarEntriesByDay[day] = []

		calendarEntriesByDay[day].push({
			type: registeredEventIds.has(event.id) ? "registered" : "event",
			title: event.title,
		})
	})

	borrowedBooks.forEach((book) => {
		if (!book.dueDate) return

		const dueDate = new Date(book.dueDate)
		if (dueDate.getFullYear() !== calendarYear || dueDate.getMonth() !== calendarMonth) return

		const day = dueDate.getDate()
		if (!calendarEntriesByDay[day]) calendarEntriesByDay[day] = []

		calendarEntriesByDay[day].push({
			type: "deadline",
			title: `${book.title} due back`,
		})
	})

	// Pick one visual style per day depending on what matters most on that date.
	const calendarCells = Array.from({ length: totalDaysInMonth }, (_, index) => {
		const dayNumber = index + 1
		const entries = calendarEntriesByDay[dayNumber] || []
		const hasRegistered = entries.some((entry) => entry.type === "registered")
		const hasDeadline = entries.some((entry) => entry.type === "deadline")
		const hasEvent = entries.some((entry) => entry.type === "event")
		let toneClass = "border-transparent bg-transparent text-gray-400 dark:text-[#9aa1a8]"

		if (hasDeadline) {
			toneClass = "border-[#b8565c] bg-[#b8565c] text-white dark:border-[#b8565c] dark:bg-[#b8565c] dark:text-white"
		} else if (hasRegistered) {
			toneClass = "border-[#1a6644]/50 bg-[#1a6644] text-white dark:border-[#1a6644]/50 dark:bg-[#1a6644] dark:text-white"
		} else if (hasEvent) {
			toneClass = "border-[#d7d9db] bg-white text-[#1c2b24] dark:border-[#8f979f] dark:bg-transparent dark:text-white"
		}

		return {
			key: `day-${dayNumber}`,
			dayNumber,
			entries,
			toneClass,
			columnStartClass: dayNumber === 1 ? `col-start-${calendarStartOffset + 1}` : "",
		}
	})

	const changeCalendarMonth = (direction) => {
		setCalendarViewDate((currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
	}

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

				// Match the borrowing rules already shown in the UI.
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

		const prefix = getUserPrefix()
		localStorage.setItem(`${prefix}reading-progress-${bookId}`, String(value))
		setBorrowedBooks((currentBooks) => [...currentBooks])
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

		<main className="mx-auto mt-10 max-w-5xl px-4 sm:px-6">

			<header className="mb-6 flex items-center justify-between gap-4">
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
			</header>

			<section
				className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]"
				aria-labelledby="profile-information-heading"
			>

				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md dark:border-[#333] dark:bg-[#242424]">
					<div className="flex flex-col justify-between gap-8 md:flex-row">
						<div className="flex-1 space-y-4">

							<h2 id="profile-information-heading" className="text-xl font-semibold text-gray-700 dark:text-white">
								Profile Information
							</h2>

							<div className="flex items-center gap-3 flex-wrap">

								<span className="font-medium text-gray-700 dark:text-white">Username:</span>

								{editingUsername ? (
									<div className="flex min-w-0 flex-1 items-center gap-2">
										<input
											className="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:border-[#006751] focus:ring-2 focus:ring-[#006751]/20 dark:bg-[#2e2e2e] dark:border-[#333] dark:text-white"
											type="text"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											aria-label="Edit username"
										/>

										<button
											className="shrink-0 bg-[#1a6644] text-white px-4 py-2 rounded-md hover:bg-[#14533a] transition"
											onClick={handleUsernameUpdate}
											aria-label="Save username"
										>
											Save
										</button>
									</div>
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
								className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-sm dark:border-[#333]"
							/>

							<label
								htmlFor="profile-picture-upload"
								className="cursor-pointer rounded-md border border-transparent bg-[#1a6644] px-4 py-2 text-sm text-white transition hover:bg-[#14533a] dark:border-[#333]"
							>
								Edit Profile Picture
							</label>

							<input
								id="profile-picture-upload"
								type="file"
								accept="image/*"
								onChange={handleProfileChange}
								className="sr-only"
								aria-label="Choose a new profile picture"
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<div className="mx-auto self-center rounded-xl border border-gray-200 bg-white p-3 shadow-md lg:mx-0 lg:self-start dark:border-[#333] dark:bg-[#242424]">
						<div className="mb-3 flex items-start justify-between gap-2">
							<div>
								<h3 className="text-[0.95rem] font-semibold text-gray-800 dark:text-white">Upcoming Events</h3>
								<div className="mt-1 flex items-center gap-2">
									<button
										type="button"
										onClick={() => changeCalendarMonth(-1)}
										className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-[0.72rem] text-gray-500 transition hover:border-[#1a6644] hover:text-[#1a6644] dark:border-[#333] dark:text-[#888] dark:hover:border-[#5ecba1] dark:hover:text-[#5ecba1]"
										aria-label="Previous month"
									>
										&lt;
									</button>
									<h4 className="min-w-[60px] text-[0.9rem] font-semibold text-gray-800 dark:text-white">{CALENDAR_MONTH_NAMES[calendarMonth]}</h4>
									<button
										type="button"
										onClick={() => changeCalendarMonth(1)}
										className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-[0.72rem] text-gray-500 transition hover:border-[#1a6644] hover:text-[#1a6644] dark:border-[#333] dark:text-[#888] dark:hover:border-[#5ecba1] dark:hover:text-[#5ecba1]"
										aria-label="Next month"
									>
										&gt;
									</button>
								</div>
							</div>
							<div className="rounded-full border border-gray-200 px-2 py-1 text-[0.6rem] font-medium text-gray-500 dark:border-[#333] dark:text-[#888]">
								{calendarYear}
							</div>
						</div>

						<div className="mb-2 grid grid-cols-7 gap-1 text-center">
							{CALENDAR_DAY_NAMES.map((day) => (
								<span key={day} className="text-[0.54rem] font-semibold uppercase tracking-[0.08em] text-gray-500 dark:text-[#888]">
									{day}
								</span>
							))}
						</div>

						<div className="grid grid-cols-7 gap-1">
							{calendarCells.map((cell) => {
								const tooltipText = cell.entries.map((entry) => entry.title).join("\n")
								const accessibilityLabel = cell.entries.length > 0
									? `${CALENDAR_MONTH_NAMES[calendarMonth]} ${cell.dayNumber}: ${cell.entries.map((entry) => entry.title).join(", ")}`
									: `${CALENDAR_MONTH_NAMES[calendarMonth]} ${cell.dayNumber}`

								return (
									<div key={cell.key} className={`group relative ${cell.columnStartClass}`}>
										<button
											type="button"
											className={`flex h-7 w-7 items-center justify-center rounded-full border text-[0.72rem] font-semibold leading-none transition ${cell.toneClass}`}
											title={tooltipText || undefined}
											aria-label={accessibilityLabel}
										>
											{cell.dayNumber}
										</button>

										{cell.entries.length > 0 && (
											<div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-40 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-[0_12px_30px_rgba(0,0,0,0.16)] group-hover:block group-focus-within:block dark:border-[#333] dark:bg-[#1b1b1b]">
												<p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gray-500 dark:text-[#888]">
													{CALENDAR_MONTH_NAMES[calendarMonth]} {cell.dayNumber}
												</p>
												<div className="space-y-1.5">
													{cell.entries.map((entry, entryIndex) => (
														<div key={`${entry.title}-${entryIndex}`} className="flex items-start gap-2 text-[0.68rem] leading-[1.4] text-gray-700 dark:text-[#d4d4d4]">
															<span
																className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
																	entry.type === "deadline"
																		? "bg-[#b8565c]"
																		: entry.type === "registered"
																			? "bg-[#1a6644]"
																			: "bg-[#f5f7f6] ring-1 ring-[#cfd4d8] dark:bg-white dark:ring-[#666]"
																}`}
															/>
															<span>{entry.title}</span>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								)
							})}
						</div>

						<div className="mt-3 border-t border-gray-200 pt-3 dark:border-[#333]">
							<p className="mb-2 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-gray-500 dark:text-[#888]">Key</p>
							<div className="flex flex-wrap gap-x-3 gap-y-2 text-[0.64rem] text-gray-600 dark:text-[#aaa]">
								<span className="inline-flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full bg-white ring-1 ring-[#cfd4d8] dark:bg-white dark:ring-[#666]" />
									Open events
								</span>
								<span className="inline-flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full bg-[#1a6644]" />
									Registered events
								</span>
								<span className="inline-flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full bg-[#b8565c]" />
									Return deadlines
								</span>
							</div>
						</div>
					</div>
				</div>

			</section>

			<section
				className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-md dark:border-[#333] dark:bg-[#242424]"
				aria-labelledby="library-activity-heading"
			>

				<h2 id="library-activity-heading" className="mb-4 text-xl font-semibold text-gray-700 dark:text-white">
					Library Activity
				</h2>

				<h3 className="font-medium text-gray-700 dark:text-white">Checked Out Books</h3>
				{borrowedBooks.length === 0 ? (
					<p className="text-gray-600 mb-4 dark:text-[#888]">No books checked out</p>
				) : (
					<ul className="mt-4 space-y-3">
						{borrowedBooks.map((book) => {
							const progress = Number(
								localStorage.getItem(`${getUserPrefix()}reading-progress-${book.id}`) ??
								localStorage.getItem(`reading-progress-${book.id}`) ??
								0
							)
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

													<div
														className="mb-1 h-2 w-full overflow-hidden rounded-full bg-[#f0ede8] dark:bg-[#2e2e2e]"
														role="progressbar"
														aria-label={`Reading progress for ${book.title}`}
														aria-valuemin={0}
														aria-valuemax={100}
														aria-valuenow={progress}
													>
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

			</section>

			<nav className="mt-8 mb-10 flex flex-wrap gap-4" aria-label="Dashboard actions">

				<button
					className="bg-[#1a6644] text-white px-5 py-2 rounded-md hover:bg-[#14533a] transition"
					type="button"
					onClick={() => navigate("/books")}
				>
					Search Books
				</button>

			</nav>

		</main>
	)
}

export default Dashboard
