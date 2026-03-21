import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { BOOKS } from "@/data/bookData"
import defaultPic from "../assets/default-profile.png"

function Dashboard() {

	const navigate = useNavigate()
	const fileInputRef = useRef(null)

	const [user, setUser] = useState(null)
	const [username, setUsername] = useState("")
	const [profilePic, setProfilePic] = useState(defaultPic)
	const [editingUsername, setEditingUsername] = useState(false)
	const [borrowedBooks, setBorrowedBooks] = useState([])
	const [readingProgress, setReadingProgress] = useState([])

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

		// Scan localStorage for this user's borrowed books & progress
		const prefix = savedUser.email ? `${savedUser.email}:` : ""
		const borrowed = []
		const progress = []

		BOOKS.forEach((book) => {
			const key = `${prefix}borrowed-${book.id}`
			let borrowVal = localStorage.getItem(key)
			const prog = Number(localStorage.getItem(`${prefix}reading-progress-${book.id}`) ?? 0)

			if (borrowVal) {
				// Migrate old "true" entries to a real date
				if (borrowVal === "true") {
					borrowVal = new Date().toISOString()
					localStorage.setItem(key, borrowVal)
				}
				const borrowDate = new Date(borrowVal)
				const returnDate = new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000)
				borrowed.push({ ...book, borrowDate, returnDate })
			}
			if (prog > 0) progress.push({ ...book, progress: prog })
		})

		setBorrowedBooks(borrowed)
		setReadingProgress(progress)

	}, [])

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

	const openFilePicker = () => {
		fileInputRef.current.click()
	}

	const handleSignOut = () => {
		localStorage.removeItem("user")
		window.dispatchEvent(new Event("storage"))
		navigate("/")
	}

	if (!user) return null

	return (

		<div className="max-w-5xl mx-auto mt-10 px-4 sm:px-6">

			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-semibold text-gray-800">
					User Account
				</h1>
				<button
					className="text-sm text-gray-500 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 hover:text-gray-700 transition"
					onClick={handleSignOut}
				>
					Sign Out
				</button>
			</div>

			{/* Profile Section */}
			<div className="flex flex-col md:flex-row justify-between gap-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">

				{/* LEFT SIDE */}
				<div className="flex-1 space-y-4">

					<h2 className="text-xl font-semibold text-gray-700">
						Profile Information
					</h2>

					{/* Username Row */}
					<div className="flex items-center gap-3 flex-wrap">

						<span className="font-medium text-gray-700">Username:</span>

						{editingUsername ? (
							<>
								<input
									className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#006751] focus:ring-2 focus:ring-[#006751]/20"
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
								<span className="text-gray-600">{user.username}</span>

								<button
									className="text-[#006751] underline cursor-pointer text-sm"
									onClick={() => setEditingUsername(true)}
									aria-label="Change username"
								>
									Change Username
								</button>
							</>
						)}

					</div>

					<p>
						<span className="font-medium text-gray-700">Email:</span>
						<span className="text-gray-600 ml-2">{user.email}</span>
					</p>

					{/* ✅ FIXED DATE JOINED */}
					<p>
						<span className="font-medium text-gray-700">Date Joined:</span>
						<span className="text-gray-600 ml-2">
							{user.createdAt
								? new Date(user.createdAt).toLocaleDateString()
								: "N/A"}
						</span>
					</p>

					<p>
						<span className="font-medium text-gray-700">Account Status:</span>
						<span className="text-green-600 ml-2">Active</span>
					</p>

				</div>

				{/* RIGHT SIDE (Profile Picture) */}
				<div className="flex flex-col items-center gap-3">

					<img
						src={profilePic}
						alt={`${user.username}'s profile picture`}
						className="w-36 h-36 rounded-full object-cover border-2 border-gray-200 shadow-sm"
					/>

					<button
						className="text-sm bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition"
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
			<div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">

				<h2 className="text-xl font-semibold mb-4 text-gray-700">
					Library Activity
				</h2>

				<h3 className="font-medium text-gray-700">Borrowed Books</h3>
				{borrowedBooks.length > 0 ? (
					<ul className="list-none p-0 mt-2 mb-4 space-y-2">
						{borrowedBooks.map((book) => (
							<li
								key={book.id}
								className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
								onClick={() => navigate(`/books/${book.id}`)}
							>
								<img
									src={book.cover}
									alt={book.title}
									className="w-10 h-14 object-cover rounded shadow-sm"
									onError={(e) => { e.currentTarget.style.display = "none" }}
								/>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-800 m-0">{book.title}</p>
									<p className="text-xs text-gray-500 m-0">{book.author}</p>
									{book.borrowDate && (
										<p className="text-xs text-gray-400 m-0 mt-1">
											Borrowed {book.borrowDate.toLocaleDateString()}
											{book.returnDate && (
												<>
													{" · "}
													<span className={book.returnDate < new Date() ? "text-red-500 font-medium" : "text-gray-400"}>
														Due {book.returnDate.toLocaleDateString()}
													</span>
												</>
											)}
										</p>
									)}
								</div>
								<span className={`ml-auto text-xs px-2 py-1 rounded whitespace-nowrap ${
									book.returnDate && book.returnDate < new Date()
										? "text-red-700 bg-red-50"
										: "text-green-700 bg-green-50"
								}`}>
									{book.returnDate && book.returnDate < new Date() ? "Overdue" : "Borrowed"}
								</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-gray-500 text-sm mt-1 mb-4">No books currently borrowed.</p>
				)}

				<h3 className="font-medium text-gray-700">Reading Progress</h3>
				{readingProgress.length > 0 ? (
					<ul className="list-none p-0 mt-2 mb-4 space-y-2">
						{readingProgress.map((book) => (
							<li
								key={book.id}
								className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
								onClick={() => navigate(`/books/${book.id}`)}
							>
								<img
									src={book.cover}
									alt={book.title}
									className="w-10 h-14 object-cover rounded shadow-sm"
									onError={(e) => { e.currentTarget.style.display = "none" }}
								/>
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-800 m-0">{book.title}</p>
									<div className="flex items-center gap-2 mt-1">
										<div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
											<div
												className="h-full rounded-full bg-[#2d7a4f]"
												style={{ width: `${book.progress}%` }}
											/>
										</div>
										<span className="text-xs text-gray-500 font-medium">{book.progress}%</span>
									</div>
								</div>
							</li>
						))}
					</ul>
				) : (
					<p className="text-gray-500 text-sm mt-1 mb-4">No reading progress tracked yet.</p>
				)}

			</div>

			{/* Actions */}
			<div className="mt-8 mb-10 flex flex-wrap gap-4">

				<button
					className="bg-[#006751] text-white px-5 py-2 rounded-md hover:bg-[#005040] transition"
					onClick={() => navigate("/catalog")}
				>
					Browse Catalog
				</button>

				<button
					className="bg-[#006751] text-white px-5 py-2 rounded-md hover:bg-[#005040] transition"
					onClick={() => navigate("/books")}
				>
					View All Books
				</button>

			</div>

		</div>
	)
}

export default Dashboard