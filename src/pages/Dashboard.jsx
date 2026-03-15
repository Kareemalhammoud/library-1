import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import styles from "../styles/dashboard.module.css"
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

		<div className={styles.container}>

			<h1 className={styles.header}>User Account</h1>

			{/* Profile Section */}

			<div className={styles.profileSection}>

				<div className={styles.profileInfo}>

					<h2>Profile Information</h2>

					<div className={styles.usernameRow}>

						<strong>Username:</strong>

						{editingUsername ? (
							<>
								<input
									className={styles.input}
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
								/>

								<button
									className={styles.button}
									onClick={handleUsernameUpdate}
								>
									Save
								</button>
							</>
						) : (
							<>
								<span className={styles.value}>{user.username}</span>

								<span
									className={styles.changeLink}
									onClick={() => setEditingUsername(true)}
								>
									Change Username
								</span>
							</>
						)}

					</div>

					<p>
						<strong>Email:</strong>
						<span className={styles.value}> {user.email}</span>
					</p>

					<p>
						<strong>Date Joined:</strong>
						<span className={styles.value}> {new Date().toLocaleDateString()}</span>
					</p>

					<p>
						<strong>Account Status:</strong>
						<span className={styles.value}> Active</span>
					</p>

				</div>

				{/* Profile Picture */}

				<div className={styles.profilePicture}>

					<img
						src={profilePic}
						alt="Profile"
						width="140"
						height="140"
						className={styles.profilePic}
					/>

					<button
						className={styles.smallButton}
						onClick={openFilePicker}
					>
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

			{/* Library Section */}

			<div className={styles.bookSection}>

				<h2>Library Activity</h2>

				<h3>Checked Out Books</h3>

				<ul>
					<li>Example Book 1</li>
					<li>Example Book 2</li>
				</ul>

				<h3>Reserved Books</h3>

				<ul>
					<li className={styles.value}>No reserved books</li>
				</ul>

				<h3>Overdue Books & Fines</h3>

				<p className={styles.value}>No overdue books</p>

			</div>

			{/* Actions */}

			<div className={styles.actions}>

				<button className={styles.button}>
					Search Books
				</button>

				<button className={styles.button}>
					Reserve Book
				</button>

				<button className={styles.button}>
					Renew Book
				</button>

			</div>

		</div>

	)

}

export default Dashboard
