import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import FormInput from "../components/FormInput"

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

		<div className="flex justify-center items-center min-h-[80vh] mt-8 px-4 font-sans bg-gray-100">

			<div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-sm">

				<h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
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

					{errorMessage && (
						<p className="text-red-600 text-sm mb-2" role="alert" aria-live="assertive">
							{errorMessage}
						</p>
					)}

					<button
						type="submit"
						className="w-full bg-[#006751] text-white py-3 rounded-md font-semibold text-base transition hover:bg-[#005040]"
					>
						Login
					</button>

				</form>

				<p className="text-center text-sm mt-5 text-gray-500">
					Don&apos;t have an account?{" "}
					<Link to="/register" className="text-[#006751] underline hover:text-[#005040]">
						Register
					</Link>
				</p>

			</div>

		</div>
	)
}

export default Login
