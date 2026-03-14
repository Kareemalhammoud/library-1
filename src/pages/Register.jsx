import {useState} from "react"
import {Link, useNavigate} from "react-router-dom"

function Register() {

    const navigate = useNavigate()

	const [username, setUsername] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")

	const handleSubmit = (e) => {
		e.preventDefault()

		if (!username || !email || !password || !confirmPassword) {
			alert("Please fill in all fields")
			return
		}

		if (password !== confirmPassword) {
			alert("Passwords do not match")
			return
		}

		const user = { username, email, password }

		localStorage.setItem("user", JSON.stringify(user))

		alert("Account created successfully")

		navigate("/login")
	}

	return (
		<div style={{ maxWidth: "400px", margin: "50px auto" }}>
			<h1>Register</h1>

			<form onSubmit={handleSubmit}>

				<label>Username</label>
				<input
					type="text"
					placeholder="Enter username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>

				<br /><br />

				<label>Email</label>
				<input
					type="email"
					placeholder="Enter email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<br /><br />

				<label>Password</label>
				<input
					type="password"
					placeholder="Enter password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>

				<br /><br />

				<label>Confirm Password</label>
				<input
					type="password"
					placeholder="Confirm password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>

				<br /><br />

				<button type="submit">Register</button>

			</form>

			<p>
				Already have an account? <Link to="/login">Login</Link>
			</p>

		</div>
	)
}

export default Register
