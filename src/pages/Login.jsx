import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function Login() {

	const navigate = useNavigate()

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")

	const handleSubmit = (e) => {
		e.preventDefault()

		if (!email || !password) {
			alert("Please fill in all fields")
			return
		}

		const savedUser = JSON.parse(localStorage.getItem("user"))

		if (!savedUser) {
			alert("No account found. Please register first.")
			return
		}

		if (email === savedUser.email && password === savedUser.password) {
			alert("Login successful")
			navigate("/dashboard")
		} else {
			alert("Invalid email or password")
		}
	}

	return (
		<div style={{ maxWidth: "400px", margin: "50px auto" }}>
			<h1>Login</h1>

			<form onSubmit={handleSubmit}>

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

				<button type="submit">Login</button>

			</form>

			<p>
				Don&apos;t have an account? <Link to="/register">Register</Link>
			</p>

		</div>
	)
}

export default Login
