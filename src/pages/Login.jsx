import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import FormInput from "../components/FormInput"

function Login() {

	const navigate = useNavigate()
	const location = useLocation()

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [fieldErrors, setFieldErrors] = useState({})
	const [formError, setFormError] = useState("")
	const [authError, setAuthError] = useState(false)

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
		if (authError) {
			setAuthError(false)
		}
	}

	const handleSubmit = async (e) => {

		e.preventDefault()
		const nextErrors = {}
		setFormError("")
		setAuthError(false)

		const trimmedEmail = email.trim()

		// Basic frontend-only login check using the saved user from localStorage.
		if (!trimmedEmail) {
			nextErrors.email = "Email is required."
		}

		if (!password) {
			nextErrors.password = "Password is required."
		}

		if (trimmedEmail && !/\S+@\S+\.\S+/.test(trimmedEmail)) {
			nextErrors.email = "Enter a valid email address."
		}

		if (Object.keys(nextErrors).length > 0) {
			setFieldErrors(nextErrors)
			return
		}

		try {
			const response = await fetch("http://localhost:5001/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: trimmedEmail,
					password,
				}),
			})

			const data = await response.json().catch(() => ({}))

			if (!response.ok) {
				throw new Error(data.message || "Login failed. Please try again.")
			}

			localStorage.setItem("token", data.token)
			localStorage.setItem("user", JSON.stringify(data.user))
			localStorage.setItem("isLoggedIn", "true")
			window.dispatchEvent(new Event("auth-change"))
			setFieldErrors({})
			setFormError("")
			setAuthError(false)
			navigate("/dashboard")
		} catch (error) {
			setFieldErrors({})
			setAuthError(true)
			setFormError(error.message || "Unable to log in. Please try again.")
		}
	}

	return (

		<main className="flex justify-center bg-gray-100 px-4 py-4 font-sans sm:mt-8 sm:min-h-[80vh] sm:items-center sm:py-8 dark:bg-[#1a1a1a]">

			<section
				className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-md sm:p-8 dark:border-[#333] dark:bg-[#242424]"
				aria-labelledby="login-heading"
			>

				<h1 id="login-heading" className="mb-6 text-center text-2xl font-semibold text-gray-800 dark:text-white">
					Login
				</h1>

				<form onSubmit={handleSubmit} aria-label="Login form" noValidate>

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
						errorId="login-email-error"
						errorText={fieldErrors.email}
						invalid={Boolean(fieldErrors.email) || authError}
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
						autoComplete="current-password"
						errorId="login-password-error"
						errorText={fieldErrors.password}
						invalid={Boolean(fieldErrors.password) || authError}
						showToggle={true}
						showPassword={showPassword}
						setShowPassword={setShowPassword}
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
						Login
					</button>

				</form>

				<p className="text-center text-sm mt-5 text-gray-500 dark:text-[#888]">
					Don&apos;t have an account?{" "}
					<Link
						to="/register"
						state={location.state}
						className="text-[#006751] underline hover:text-[#005040] dark:text-[#5ecba1] dark:hover:text-white"
					>
						Register
					</Link>
				</p>

			</section>

		</main>
	)
}

export default Login
