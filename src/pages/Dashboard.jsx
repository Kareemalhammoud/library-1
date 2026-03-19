import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import defaultPic from "../assets/default-profile.png"

function Dashboard() {

	const navigate = useNavigate()
	const fileInputRef = useRef(null)

	const [user, setUser] = useState(null)
	const [username, setUsername] = useState("")
	const [profilePic, setProfilePic] = useState(defaultPic)
	const [editingUsername, setEditingUsername] = useState(false)

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

	if (!user) return null

	return (

		<div className="max-w-5xl mx-auto mt-10 px-6">

			<h1 className="text-3xl font-semibold mb-6 text-gray-800">
				User Account
			</h1>

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
								/>

								<button
									className="bg-[#006751] text-white px-4 py-2 rounded-md hover:bg-[#005040] transition"
									onClick={handleUsernameUpdate}
								>
									Save
								</button>
							</>
						) : (
							<>
								<span className="text-gray-600">{user.username}</span>

								<span
									className="text-[#006751] underline cursor-pointer text-sm"
									onClick={() => setEditingUsername(true)}
								>
									Change Username
								</span>
							</>
						)}

					</div>

					<p>
						<span className="font-medium text-gray-700">Email:</span>
						<span className="text-gray-600 ml-2">{user.email}</span>
					</p>

					<p>
						<span className="font-medium text-gray-700">Date Joined:</span>
						<span className="text-gray-600 ml-2">{new Date().toLocaleDateString()}</span>
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
						alt="Profile"
						className="w-36 h-36 rounded-full object-cover border-2 border-gray-200 shadow-sm"
					/>

					<button
						className="text-sm bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition"
						onClick={openFilePicker}
					>
						Edit Profile Picture
					</button>

					<input
						type="file"
						accept="image/*"
						ref={fileInputRef}
						onChange={handleProfileChange}
						className="hidden"
					/>

				</div>

			</div>

			{/* Library Section */}
			<div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">

				<h2 className="text-xl font-semibold mb-4 text-gray-700">
					Library Activity
				</h2>

				<h3 className="font-medium text-gray-700">Checked Out Books</h3>
				<ul className="list-disc ml-6 text-gray-600 mb-4">
					<li>Example Book 1</li>
					<li>Example Book 2</li>
				</ul>

				<h3 className="font-medium text-gray-700">Reserved Books</h3>
				<ul className="list-disc ml-6 text-gray-600 mb-4">
					<li>No reserved books</li>
				</ul>

				<h3 className="font-medium text-gray-700">Overdue Books & Fines</h3>
				<p className="text-gray-600">No overdue books</p>

			</div>

			{/* Actions */}
			<div className="mt-8 flex flex-wrap gap-4">

				<button className="bg-[#006751] text-white px-5 py-2 rounded-md hover:bg-[#005040] transition">
					Search Books
				</button>

				<button className="bg-[#006751] text-white px-5 py-2 rounded-md hover:bg-[#005040] transition">
					Reserve Book
				</button>

				<button className="bg-[#006751] text-white px-5 py-2 rounded-md hover:bg-[#005040] transition">
					Renew Book
				</button>

			</div>

		</div>
	)
}

export default Dashboard