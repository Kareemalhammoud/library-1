import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import FormInput from "../components/FormInput"

function Register() {

	const navigate = useNavigate()
	const location = useLocation()

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

		const user = {
			username,
			email,
			password,
			createdAt: new Date().toISOString()
		}

		localStorage.setItem("user", JSON.stringify(user))
		localStorage.setItem("isLoggedIn", "true")

		navigate(location.state?.from || "/dashboard")
	}

	return (

		<div className="flex justify-center px-4 py-4 font-sans bg-gray-100 sm:mt-8 sm:min-h-[80vh] sm:items-center sm:py-8 dark:bg-[#1a1a1a]">

			<div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-sm dark:bg-[#242424] dark:border-[#333]">

				<h1 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
					Register
				</h1>

				<form onSubmit={handleSubmit} aria-label="Register form">

					<FormInput
						label="Username"
						id="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="Enter username"
					/>

					<FormInput
						label="Email"
						type="email"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter email"
					/>

					<FormInput
						label="Password"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter password"
						showToggle={true}
						showPassword={showPassword}
						setShowPassword={setShowPassword}
					/>

					<FormInput
						label="Confirm Password"
						type={showPassword ? "text" : "password"}
						id="confirmPassword"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirm password"
					/>

					{errorMessage && (
						<p className="text-red-600 text-sm mb-2 dark:text-red-400" aria-live="assertive">
							{errorMessage}
						</p>
					)}

					<button
						type="submit"
						className="w-full bg-[#1a6644] text-white py-3 rounded-md font-semibold text-base transition hover:bg-[#14533a]"
					>
						Register
					</button>

				</form>

				<p className="text-center text-sm mt-5 text-gray-500 dark:text-[#888]">
					Already have an account?{" "}
					<Link
						to="/login"
						state={location.state}
						className="text-[#006751] underline hover:text-[#005040] dark:text-[#5ecba1] dark:hover:text-white"
					>
						Login
					</Link>
				</p>

			</div>

		</div>
	)
}

export default Register
