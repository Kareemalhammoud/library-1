import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import styles from "../styles/auth.module.css"

function Register() {

	const navigate = useNavigate()

	const [username, setUsername] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")

	const [showPassword, setShowPassword] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")

	const handleSubmit = (e) => {
		e.preventDefault()

		if (!username || !email || !password || !confirmPassword) {
			setErrorMessage("Please fill in all fields")
			return
		}

		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@$!%*?&]).{8,}$/

		if (!passwordRegex.test(password)) {
			setErrorMessage(
				"Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
			)
			return
		}

		if (password !== confirmPassword) {
			setErrorMessage("Passwords do not match")
			return
		}

		const existingUser = JSON.parse(localStorage.getItem("user"))

		if (existingUser && existingUser.email === email) {
			setErrorMessage("An account with this email already exists")
			return
		}

		setErrorMessage("")

		const user = { username, email, password }

		localStorage.setItem("user", JSON.stringify(user))

		navigate("/dashboard")
	}

	return (

		<div className={styles.container}>

			<div className={styles.card}>

				<h1 className={styles.title}>Register</h1>

				<form onSubmit={handleSubmit}>

					<div className={styles.formGroup}>
						<label>Username</label>
						<input
							className={styles.input}
							type="text"
							placeholder="Enter username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>

					<div className={styles.formGroup}>
						<label>Email</label>
						<input
							className={styles.input}
							type="email"
							placeholder="Enter email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>

					<div className={styles.formGroup}>
						<label>Password</label>

						<div className={styles.passwordWrapper}>

							<input
								className={styles.input}
								type={showPassword ? "text" : "password"}
								placeholder="Enter password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>

							<span
								className={styles.eyeIcon}
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? <FaEye /> : <FaEyeSlash />}
							</span>

						</div>

					</div>

					<div className={styles.formGroup}>
						<label>Confirm Password</label>

						<input
							className={styles.input}
							type={showPassword ? "text" : "password"}
							placeholder="Confirm password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>

					</div>

					{errorMessage && (
						<p className={styles.errorText}>{errorMessage}</p>
					)}

					<button className={styles.button} type="submit">
						Register
					</button>

				</form>

				<p className={styles.linkText}>
					Already have an account? <Link to="/login">Login</Link>
				</p>

			</div>

		</div>

	)
}

export default Register