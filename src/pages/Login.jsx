import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import FormInput from "../components/FormInput"

function Login() {

	const navigate = useNavigate()
	const location = useLocation()
	const errorId = "login-form-error"

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")

	const handleSubmit = (e) => {

		e.preventDefault()

		// Basic frontend-only login check using the saved user from localStorage.
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
			localStorage.setItem("isLoggedIn", "true")
			navigate(location.state?.from || "/dashboard")
		} else {
			setErrorMessage("Invalid email or password")
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

				<form onSubmit={handleSubmit} aria-label="Login form">

					<FormInput
						label="Email"
						type="email"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter email"
						autoComplete="email"
						errorId={errorId}
						invalid={Boolean(errorMessage)}
					/>

					<FormInput
						label="Password"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter password"
						autoComplete="current-password"
						errorId={errorId}
						invalid={Boolean(errorMessage)}
						showToggle={true}
						showPassword={showPassword}
						setShowPassword={setShowPassword}
					/>

					{errorMessage && (
						<p
							id={errorId}
							className="mb-2 text-sm text-red-600 dark:text-red-400"
							role="alert"
							aria-live="assertive"
						>
							{errorMessage}
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
