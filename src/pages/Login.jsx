import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import styles from "../styles/auth.module.css"


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
		<div className={styles.container}>

			<div className={styles.card}>

				<h1 className={styles.title}>Login</h1>

				<form onSubmit={handleSubmit}>

					<div className={styles.formGroup}>
						<label>Email</label>
						<input
							className={styles.input}
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>

					<div className={styles.formGroup}>
						<label>Password</label>
						<input
							className={styles.input}
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					<button className={styles.button}>
						Login
					</button>

				</form>

				<p className={styles.linkText}>
					Don&apos;t have an account? <Link to="/register">Register</Link>
				</p>

			</div>

		</div>
	)
}

export default Login
