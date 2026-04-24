import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import FormInput from "../components/FormInput"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function Register() {

	const navigate = useNavigate()
	const location = useLocation()

	const [username, setUsername] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")

	const [showPassword, setShowPassword] = useState(false)
	const [fieldErrors, setFieldErrors] = useState({})
	const [formError, setFormError] = useState("")

	const clearFieldError = (field) => {
		setFieldErrors((currentErrors) => {
			if (!currentErrors[field]) {
				return currentErrors
			}

			const nextErrors = { ...currentErrors }
			delete nextErrors[field]
			return nextErrors
		})
	}

	const clearErrorsOnChange = (field) => {
		clearFieldError(field)
		if (formError) {
			setFormError("")
		}
	}

	const handleSubmit = async (e) => {

		e.preventDefault()
		const nextErrors = {}
		setFormError("")

		const trimmedUsername = username.trim()
		const trimmedEmail = email.trim()

		// Keep registration validation on the frontend for this phase.
		if (!trimmedUsername) {
			nextErrors.username = true
		}

		if (!trimmedEmail) {
			nextErrors.email = true
		}

		if (!password) {
			nextErrors.password = true
		}

		if (!confirmPassword) {
			nextErrors.confirmPassword = true
		}

		if (Object.keys(nextErrors).length > 0) {
			setFieldErrors(nextErrors)
			setFormError("Please fill in all fields.")
			return
		}

		if (trimmedEmail && !/\S+@\S+\.\S+/.test(trimmedEmail)) {
			nextErrors.email = "Enter a valid email address."
		}

		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@$!%*?&]).{8,}$/

		if (password && !passwordRegex.test(password)) {
			nextErrors.password =
				"Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
		}

		if (password && confirmPassword && password !== confirmPassword) {
			nextErrors.confirmPassword = "Passwords do not match."
		}

		if (Object.keys(nextErrors).length > 0) {
			setFieldErrors(nextErrors)
			return
		}

		try {
			const response = await fetch(`${API_BASE}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					full_name: trimmedUsername,
					email: trimmedEmail,
					password,
				}),
			})

			const data = await response.json().catch(() => ({}))

			if (!response.ok) {
				throw new Error(data.message || "Registration failed. Please try again.")
			}

			localStorage.setItem("token", data.token)
			localStorage.setItem("user", JSON.stringify(data.user))
			localStorage.setItem("isLoggedIn", "true")
			window.dispatchEvent(new Event("auth-change"))
			setFieldErrors({})
			setFormError("")
			navigate("/dashboard")
		} catch (error) {
			setFieldErrors({})
			setFormError(error.message || "Unable to register. Please try again.")
		}
	}

	return (

		<main className="flex justify-center bg-gray-100 px-4 py-4 font-sans sm:mt-8 sm:min-h-[80vh] sm:items-center sm:py-8 dark:bg-[#1a1a1a]">

			<section
				className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-md sm:p-8 dark:border-[#333] dark:bg-[#242424]"
				aria-labelledby="register-heading"
			>

				<h1 id="register-heading" className="mb-6 text-center text-2xl font-semibold text-gray-800 dark:text-white">
					Register
				</h1>

				<form onSubmit={handleSubmit} aria-label="Register form" noValidate>

					<FormInput
						label="Username"
						id="username"
						value={username}
						onChange={(e) => {
							setUsername(e.target.value)
							clearErrorsOnChange("username")
						}}
						placeholder="Enter username"
						autoComplete="username"
						errorId="register-username-error"
						errorText={typeof fieldErrors.username === "string" ? fieldErrors.username : ""}
						invalid={Boolean(fieldErrors.username)}
					/>

					<FormInput
						label="Email"
						type="email"
						id="email"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value)
							clearErrorsOnChange("email")
						}}
						placeholder="Enter email"
						autoComplete="email"
						errorId="register-email-error"
						errorText={typeof fieldErrors.email === "string" ? fieldErrors.email : ""}
						invalid={Boolean(fieldErrors.email)}
					/>

					<FormInput
						label="Password"
						id="password"
						value={password}
						onChange={(e) => {
							setPassword(e.target.value)
							clearErrorsOnChange("password")
						}}
						placeholder="Enter password"
						autoComplete="new-password"
						errorId="register-password-error"
						errorText={typeof fieldErrors.password === "string" ? fieldErrors.password : ""}
						invalid={Boolean(fieldErrors.password)}
						showToggle={true}
						showPassword={showPassword}
						setShowPassword={setShowPassword}
					/>

					<FormInput
						label="Confirm Password"
						type={showPassword ? "text" : "password"}
						id="confirmPassword"
						value={confirmPassword}
						onChange={(e) => {
							setConfirmPassword(e.target.value)
							clearErrorsOnChange("confirmPassword")
						}}
						placeholder="Confirm password"
						autoComplete="new-password"
						errorId="register-confirm-password-error"
						errorText={typeof fieldErrors.confirmPassword === "string" ? fieldErrors.confirmPassword : ""}
						invalid={Boolean(fieldErrors.confirmPassword)}
					/>

					{formError && (
						<p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert" aria-live="assertive">
							{formError}
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

			</section>

		</main>
	)
}

export default Register
