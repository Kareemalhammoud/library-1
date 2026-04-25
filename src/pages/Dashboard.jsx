import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import defaultPic from "../assets/default-profile.png"
import { BOOKS } from "../data/bookData"
import { getStoredUser } from "../utils"
import { getFavorites, removeFavorite } from "../utils/api"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
const DASHBOARD_URL = `${API_BASE}/dashboard`

function formatDate(value) {
	if (!value) return "N/A"
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString()
}

function getBookMeta(entry) {
	if (!entry) return null

	return (
		BOOKS.find(
			(book) =>
				book.title === entry.title &&
				(!entry.author || book.author === entry.author)
		) ||
		BOOKS.find((book) => book.title === entry.title) ||
		null
	)
}

function EmptyState({ title, description }) {
	return (
		<div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-600 shadow-sm dark:border-[#333] dark:bg-[#242424] dark:text-[#888]">
			<p className="mb-1 font-semibold text-gray-800 dark:text-white">{title}</p>
			<p className="leading-6">{description}</p>
		</div>
	)
}

function LoanRow({ entry, variant = "active" }) {
	const navigate = useNavigate()
	const bookMeta = getBookMeta(entry)
	const bookId = bookMeta?.id
	const badgeClass =
		variant === "overdue"
			? "bg-[#b8565c] text-white"
			: variant === "renewal"
				? "bg-[#1a6644] text-white"
				: "bg-[#eef2ef] text-[#355246] dark:bg-[#2e2e2e] dark:text-[#c5cec9]"

	return (
		<li className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm dark:border-[#333] dark:bg-[#242424] dark:text-white">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-center gap-4">
						{bookMeta ? (
							<button
								type="button"
								className="w-[52px] flex-shrink-0 cursor-pointer border-0 bg-transparent p-0 text-left"
								onClick={() => navigate(`/books/${bookId}`)}
								aria-label={`View ${entry.title}`}
							>
							<img
								src={bookMeta.cover}
								alt={`Cover of ${entry.title}`}
								className="aspect-[2/3] w-full rounded-md object-cover shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
							/>
						</button>
					) : (
						<div className="flex h-[78px] w-[52px] flex-shrink-0 items-center justify-center rounded-md bg-[#eef2ef] text-[0.7rem] font-semibold text-[#355246] dark:bg-[#2e2e2e] dark:text-[#c5cec9]">
							Book
						</div>
					)}

					<div className="min-w-0">
						{bookMeta ? (
							<button
								type="button"
								className="cursor-pointer border-0 bg-transparent p-0 text-left"
								onClick={() => navigate(`/books/${bookId}`)}
							>
								<p className="truncate text-left text-lg font-semibold text-gray-800 dark:text-white">
									{entry.title}
								</p>
							</button>
						) : (
							<p className="truncate text-lg font-semibold text-gray-800 dark:text-white">
								{entry.title}
							</p>
						)}

						<p className="text-sm text-gray-600 dark:text-[#888]">
							{entry.author || bookMeta?.author || "Unknown author"}
						</p>

						<div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-[#888]">
							{variant === "active" && (
								<>
									<span>Borrowed {formatDate(entry.borrow_date)}</span>
									<span>Due {formatDate(entry.due_date)}</span>
								</>
							)}
							{variant === "history" && (
								<>
									<span>Borrowed {formatDate(entry.borrow_date)}</span>
									<span>Returned {formatDate(entry.return_date)}</span>
									<span>Due {formatDate(entry.due_date)}</span>
								</>
							)}
							{variant === "overdue" && (
								<>
									<span>Due {formatDate(entry.due_date)}</span>
									<span className="text-[#b8565c] dark:text-[#ff9ba3]">Overdue</span>
								</>
							)}
							{variant === "renewal" && (
								<>
									<span>Due {formatDate(entry.due_date)}</span>
									<span>{entry.renew_count ?? 0} renewals</span>
								</>
							)}
						</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<span className={`rounded-full px-3 py-1 text-[0.66rem] font-bold uppercase tracking-[0.12em] ${badgeClass}`}>
						{variant === "active" && (entry.status || "Active")}
						{variant === "history" && (entry.status || "History")}
						{variant === "overdue" && "Overdue"}
						{variant === "renewal" && "Renewed"}
					</span>
				</div>
			</div>
		</li>
	)
}

function Dashboard() {
	const navigate = useNavigate()

	const [user, setUser] = useState(null)
	const [username, setUsername] = useState("")
	const [profilePic, setProfilePic] = useState(defaultPic)
	const [editingUsername, setEditingUsername] = useState(false)
	const [dashboardData, setDashboardData] = useState({
		activeLoans: [],
		history: [],
		overdue: [],
		renewals: [],
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [favorites, setFavorites] = useState([])
	const [favoritesLoading, setFavoritesLoading] = useState(true)
	const [favoritesError, setFavoritesError] = useState("")
	const [removingFavoriteId, setRemovingFavoriteId] = useState(null)

	useEffect(() => {
		const savedUser = getStoredUser()
		const token = localStorage.getItem("token")

		if (!savedUser || !token) {
			navigate("/login")
			return
		}

		setUser(savedUser)
		setUsername(savedUser.full_name || savedUser.username || "")

		if (savedUser.profilePic) {
			setProfilePic(savedUser.profilePic)
		}

		let isActive = true

		const loadDashboard = async () => {
			setLoading(true)
			setError("")

			try {
				const response = await fetch(DASHBOARD_URL, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				const data = await response.json().catch(() => ({}))

				if (response.status === 401) {
					localStorage.removeItem("token")
					localStorage.removeItem("user")
					localStorage.setItem("isLoggedIn", "false")
					window.dispatchEvent(new Event("auth-change"))
					navigate("/login")
					return
				}

				if (!response.ok) {
					throw new Error(data.message || "Failed to load dashboard data.")
				}

				if (!isActive) return

				setDashboardData({
					activeLoans: Array.isArray(data.activeLoans) ? data.activeLoans : [],
					history: Array.isArray(data.history) ? data.history : [],
					overdue: Array.isArray(data.overdue) ? data.overdue : [],
					renewals: Array.isArray(data.renewals) ? data.renewals : [],
				})
			} catch (fetchError) {
				if (isActive) {
					setError(fetchError.message || "Unable to load dashboard data.")
				}
			} finally {
				if (isActive) {
					setLoading(false)
				}
			}
		}

		loadDashboard()

		// Favorites live on their own endpoint; fetch them in parallel so a slow
		// dashboard query doesn't block the favorites section from showing up.
		setFavoritesLoading(true)
		setFavoritesError("")
		getFavorites()
			.then((favs) => {
				if (isActive) setFavorites(favs)
			})
			.catch((err) => {
				if (isActive) setFavoritesError(err.message || "Failed to load favorites")
			})
			.finally(() => {
				if (isActive) setFavoritesLoading(false)
			})

		return () => {
			isActive = false
		}
	}, [navigate])

	async function handleRemoveFavorite(bookId) {
		setRemovingFavoriteId(bookId)
		const previous = favorites
		// Optimistic update — snap the UI, roll back if the DELETE fails.
		setFavorites((list) => list.filter((b) => b.id !== bookId))
		try {
			await removeFavorite(bookId)
		} catch {
			setFavorites(previous)
		} finally {
			setRemovingFavoriteId(null)
		}
	}

	const handleRetry = () => {
		const token = localStorage.getItem("token")
		if (!token) {
			navigate("/login")
			return
		}

		setLoading(true)
		setError("")

		fetch(DASHBOARD_URL, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then(async (response) => {
				const data = await response.json().catch(() => ({}))

				if (response.status === 401) {
					localStorage.removeItem("token")
					localStorage.removeItem("user")
					localStorage.setItem("isLoggedIn", "false")
					window.dispatchEvent(new Event("auth-change"))
					navigate("/login")
					return null
				}

				if (!response.ok) {
					throw new Error(data.message || "Failed to load dashboard data.")
				}

				return data
			})
			.then((data) => {
				if (!data) return
				setDashboardData({
					activeLoans: Array.isArray(data.activeLoans) ? data.activeLoans : [],
					history: Array.isArray(data.history) ? data.history : [],
					overdue: Array.isArray(data.overdue) ? data.overdue : [],
					renewals: Array.isArray(data.renewals) ? data.renewals : [],
				})
			})
			.catch((fetchError) => {
				setError(fetchError.message || "Unable to load dashboard data.")
			})
			.finally(() => {
				setLoading(false)
			})
	}

	const handleUsernameUpdate = () => {
		const updatedUser = {
			...user,
			full_name: username,
			username,
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
				profilePic: reader.result,
			}

			localStorage.setItem("user", JSON.stringify(updatedUser))
			setUser(updatedUser)
			setProfilePic(reader.result)
		}

		reader.readAsDataURL(file)
	}

	const handleLogout = () => {
		localStorage.removeItem("token")
		localStorage.removeItem("user")
		localStorage.setItem("isLoggedIn", "false")
		window.dispatchEvent(new Event("auth-change"))
		navigate("/login")
	}

	const activeLoans = dashboardData.activeLoans
	const history = dashboardData.history
	const overdue = dashboardData.overdue
	const renewals = dashboardData.renewals

	const displayName = username || user?.full_name || user?.username || "Member"

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

							<div className="flex flex-wrap items-center gap-3">
								<span className="font-medium text-gray-700 dark:text-white">Username:</span>

								{editingUsername ? (
									<div className="flex min-w-0 flex-1 items-center gap-2">
										<input
											className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-[#006751] focus:outline-none focus:ring-2 focus:ring-[#006751]/20 dark:border-[#333] dark:bg-[#2e2e2e] dark:text-white"
											type="text"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											aria-label="Edit username"
										/>

										<button
											className="shrink-0 rounded-md bg-[#1a6644] px-4 py-2 text-white transition hover:bg-[#14533a]"
											onClick={handleUsernameUpdate}
											aria-label="Save username"
										>
											Save
										</button>
									</div>
								) : (
									<>
										<span className="text-gray-600 dark:text-[#888]">{displayName}</span>

										<button
											className="cursor-pointer text-sm text-[#006751] underline dark:text-[#5ecba1] dark:hover:text-white"
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
								<span className="ml-2 text-gray-600 dark:text-[#888]">{user?.email || "N/A"}</span>
							</p>

							<p>
								<span className="font-medium text-gray-700 dark:text-white">Date Joined:</span>
								<span className="ml-2 text-gray-600 dark:text-[#888]">
									{user?.createdAt || user?.created_at
										? new Date(user.createdAt || user.created_at).toLocaleDateString()
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
								alt={`${displayName}'s profile picture`}
								className="h-32 w-32 rounded-full border-2 border-gray-200 object-cover shadow-sm dark:border-[#333]"
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
					<div className="mx-auto self-center rounded-xl border border-gray-200 bg-white p-4 shadow-md lg:mx-0 lg:self-start dark:border-[#333] dark:bg-[#242424]">
						<div className="mb-3 flex items-start justify-between gap-2">
							<div>
								<h3 className="text-[0.95rem] font-semibold text-gray-800 dark:text-white">
									Loan Summary
								</h3>
								<p className="mt-1 text-[0.72rem] text-gray-500 dark:text-[#888]">
									Live data from the library API
								</p>
							</div>
							<div className="rounded-full border border-gray-200 px-2 py-1 text-[0.6rem] font-medium text-gray-500 dark:border-[#333] dark:text-[#888]">
								{loading ? "..." : "Live"}
							</div>
						</div>

						<div className="space-y-3 text-[0.72rem] text-gray-600 dark:text-[#aaa]">
							<div className="flex items-center justify-between rounded-lg bg-[#f8f7f4] px-3 py-2 dark:bg-[#1a1a1a]">
								<span>Active loans</span>
								<span className="font-semibold text-gray-800 dark:text-white">{loading ? "..." : activeLoans.length}</span>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-[#f8f7f4] px-3 py-2 dark:bg-[#1a1a1a]">
								<span>Overdue</span>
								<span className="font-semibold text-gray-800 dark:text-white">{loading ? "..." : overdue.length}</span>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-[#f8f7f4] px-3 py-2 dark:bg-[#1a1a1a]">
								<span>Renewals</span>
								<span className="font-semibold text-gray-800 dark:text-white">{loading ? "..." : renewals.length}</span>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-[#f8f7f4] px-3 py-2 dark:bg-[#1a1a1a]">
								<span>History</span>
								<span className="font-semibold text-gray-800 dark:text-white">{loading ? "..." : history.length}</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section
				className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-md dark:border-[#333] dark:bg-[#242424]"
				aria-labelledby="library-activity-heading"
			>
				<div className="mb-4 flex items-start justify-between gap-4">
					<div>
						<h2 id="library-activity-heading" className="text-xl font-semibold text-gray-700 dark:text-white">
							Library Activity
						</h2>
						<p className="mt-1 text-sm text-gray-500 dark:text-[#888]">
							Active loans, history, overdue items, and renewals from the backend.
						</p>
					</div>

					{error && (
						<button
							type="button"
							className="rounded-md border border-[#b8565c] px-4 py-2 text-sm font-medium text-[#b8565c] transition hover:bg-[#b8565c]/5 dark:border-[#ff9ba3] dark:text-[#ff9ba3]"
							onClick={handleRetry}
						>
							Retry
						</button>
					)}
				</div>

				{error && (
					<div
						className="mb-6 rounded-xl border border-[#f1c3c6] bg-[#fff5f6] px-4 py-3 text-sm text-[#8a2d35] dark:border-[#6d3940] dark:bg-[#2a171a] dark:text-[#ffb4bb]"
						role="alert"
					>
						{error}
					</div>
				)}

				<div className="space-y-8">
					<section>
						<h3 className="font-medium text-gray-700 dark:text-white">Active Loans</h3>
						<div className="mt-4">
							{loading ? (
								<EmptyState
									title="Loading active loans"
									description="We are fetching your current loans from the server."
								/>
							) : activeLoans.length === 0 ? (
								<EmptyState
									title="No active loans"
									description="You do not have any active loans right now."
								/>
							) : (
								<ul className="space-y-3">
									{activeLoans.map((entry) => (
										<LoanRow key={entry.id} entry={entry} variant="active" />
									))}
								</ul>
							)}
						</div>
					</section>

					<section>
						<h3 className="font-medium text-gray-700 dark:text-white">Overdue Books & Fines</h3>
						<div className="mt-4">
							{loading ? (
								<EmptyState
									title="Loading overdue items"
									description="We are checking your overdue loans from the server."
								/>
							) : overdue.length === 0 ? (
								<EmptyState
									title="No overdue books"
									description="You are all caught up."
								/>
							) : (
								<ul className="space-y-3">
									{overdue.map((entry) => (
										<LoanRow key={entry.id} entry={entry} variant="overdue" />
									))}
								</ul>
							)}
						</div>
					</section>

					<section>
						<h3 className="font-medium text-gray-700 dark:text-white">Renewals</h3>
						<div className="mt-4">
							{loading ? (
								<EmptyState
									title="Loading renewals"
									description="We are fetching renewed items from the server."
								/>
							) : renewals.length === 0 ? (
								<EmptyState
									title="No renewals"
									description="Nothing has been renewed yet."
								/>
							) : (
								<ul className="space-y-3">
									{renewals.map((entry) => (
										<LoanRow key={entry.id} entry={entry} variant="renewal" />
									))}
								</ul>
							)}
						</div>
					</section>

					<section>
						<h3 className="font-medium text-gray-700 dark:text-white">Loan History</h3>
						<div className="mt-4">
							{loading ? (
								<EmptyState
									title="Loading loan history"
									description="We are fetching your full loan history from the server."
								/>
							) : history.length === 0 ? (
								<EmptyState
									title="No loan history"
									description="Your borrowing history will appear here once loans exist."
								/>
							) : (
								<ul className="space-y-3">
									{history.map((entry) => (
										<LoanRow key={entry.id} entry={entry} variant="history" />
									))}
								</ul>
							)}
						</div>
					</section>
				</div>
			</section>

			<section
				className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-[#242424]"
				aria-labelledby="favorites-heading"
			>
				<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
					<h2 id="favorites-heading" className="text-xl font-semibold text-gray-700 dark:text-white">
						Favorites
					</h2>
					<span className="text-sm text-gray-500 dark:text-[#888]">
						{favorites.length} saved
					</span>
				</div>

				{favoritesLoading ? (
					<div className="flex items-center gap-3 py-6">
						<div className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#e5e2dc] border-t-[#1a6644] dark:border-[#333] dark:border-t-[#5ecba1]" />
						<p className="text-sm text-gray-500 dark:text-[#888]">Loading favorites...</p>
					</div>
				) : favoritesError ? (
					<p className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-[#3b1c1a] dark:text-[#ff9388]">
						{favoritesError}
					</p>
				) : favorites.length === 0 ? (
					<div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-gray-200 bg-gray-50 p-6 dark:border-[#333] dark:bg-[#1a1a1a]">
						<p className="text-sm text-gray-600 dark:text-[#888]">
							You haven&apos;t saved any books yet. Tap the heart on any book page to add it here.
						</p>
						<Link
							to="/catalog"
							className="rounded-md bg-[#1a6644] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#14533a]"
						>
							Browse the catalog
						</Link>
					</div>
				) : (
					<ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{favorites.map((book) => (
							<li key={book.id} className="flex flex-col gap-2">
								<Link
									to={`/books/${book.id}`}
									aria-label={`View ${book.title}`}
									className="group relative block aspect-[2/3] overflow-hidden rounded-[3px_7px_7px_3px] bg-[#e5e2dc] shadow-[-2px_0_4px_rgba(28,43,36,0.14),0_2px_0_rgba(28,43,36,0.06),0_4px_14px_rgba(28,43,36,0.12)] transition hover:-translate-y-1 dark:bg-[#1a1a1a]"
								>
									<img
										src={book.cover}
										alt={`Cover of ${book.title}`}
										className="h-full w-full object-cover"
										loading="lazy"
										onError={(e) => {
											e.currentTarget.style.display = "none"
										}}
									/>
								</Link>
								<div>
									<p className="line-clamp-2 text-[0.82rem] font-semibold leading-[1.3] text-gray-800 dark:text-white">
										{book.title}
									</p>
									<p className="text-[0.72rem] text-gray-500 dark:text-[#888]">{book.author}</p>
								</div>
								<button
									type="button"
									onClick={() => handleRemoveFavorite(book.id)}
									disabled={removingFavoriteId === book.id}
									aria-label={`Remove ${book.title} from favorites`}
									title="Remove from favorites"
									className="inline-flex h-7 w-7 items-center justify-center self-start rounded-md border border-[#d0ddd8] bg-white text-[#b5392b] transition hover:border-[#c0392b] hover:bg-[#fdecea] disabled:opacity-50 dark:border-[#2a2a2a] dark:bg-[#121212] dark:text-[#ff9388] dark:hover:border-[#ff9388] dark:hover:bg-[#3b1c1a]"
								>
									<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
										<path d="M4 7h16" />
										<path d="M10 11v6M14 11v6" />
										<path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" />
										<path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
									</svg>
								</button>
							</li>
						))}
					</ul>
				)}
			</section>

			<nav className="mt-8 mb-10 flex flex-wrap gap-4" aria-label="Dashboard actions">
				<button
					className="rounded-md bg-[#1a6644] px-5 py-2 text-white transition hover:bg-[#14533a]"
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
