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

		alert("Username updated")

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

		<div style={{ maxWidth: "900px", margin: "40px auto" }}>

			<h1>User Account</h1>

			<hr />

			<div style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center"
			}}>

				{/* Profile Information */}

				<div>

					<h2>Profile Information</h2>

					{/* Username Section */}

					<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

						<strong>Username:</strong>

						{editingUsername ? (
							<>

								<input
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
								/>

								<button
									onClick={() => {
										handleUsernameUpdate()
										setEditingUsername(false)
									}}
								>
									Save
								</button>

							</>
						) : (
							<>

								<span>{user.username}</span>

								<span
									onClick={() => setEditingUsername(true)}
									style={{
										color: "#2e7d32",
										textDecoration: "underline",
										cursor: "pointer",
										fontSize: "14px"
									}}
								>
									Change Username
								</span>

							</>
						)}

					</div>

					<p><strong>Email:</strong> {user.email}</p>
					<p><strong>Date Joined:</strong> {new Date().toLocaleDateString()}</p>
					<p><strong>Account Status:</strong> Active</p>

				</div>

				{/* Profile Picture */}

				<div style={{ textAlign: "center" }}>

					<img
						src={profilePic}
						alt="Profile"
						width="140"
						height="140"
						style={{
							borderRadius: "50%",
							objectFit: "cover",
							border: "2px solid #ccc"
						}}
					/>

					<br /><br />

					<button onClick={openFilePicker}>
						Edit Profile Picture
					</button>

					<input
						type="file"
						accept="image/*"
						ref={fileInputRef}
						onChange={handleProfileChange}
						style={{ display: "none" }}
					/>

				</div>

			</div>

			<hr />

			<h2>Books</h2>

			<h3>Checked Out Books</h3>
			<ul>
				<li>Example Book 1</li>
				<li>Example Book 2</li>
			</ul>

			<h3>Reserved Books</h3>
			<ul>
				<li>No reserved books</li>
			</ul>

			<h3>Overdue Books & Fines</h3>
			<p>No overdue books</p>

			<hr />

			<div style={{ display: "flex", gap: "10px" }}>

				<button>Search Books</button>
				<button>Reserve Book</button>
				<button>Renew Book</button>

			</div>

		</div>

	)

}

export default Dashboard