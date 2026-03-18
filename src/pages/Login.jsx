import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import styles from "../styles/auth.module.css"

function Login() {

	const navigate = useNavigate()

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")

	const handleSubmit = (e) => {

		e.preventDefault()

		if (!email || !password) {
			setErrorMessage("Please fill in all fields")
			return
		}

		const savedUser = JSON.parse(localStorage.getItem("user"))

		if (!savedUser) {
			setErrorMessage("No account found. Please register first.")
			return
		}

		if (email === savedUser.email && password === savedUser.password) {
			setErrorMessage("")
			navigate("/dashboard")
		} else {
			setErrorMessage("Invalid email or password")
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

					{errorMessage && (
						<p className={styles.errorText}>{errorMessage}</p>
					)}

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