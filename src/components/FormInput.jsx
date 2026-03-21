import { FaEye, FaEyeSlash } from "react-icons/fa"

function FormInput({
	label,
	type = "text",
	id,
	value,
	onChange,
	placeholder,
	showToggle = false,
	showPassword,
	setShowPassword
}) {

	const inputType = showToggle
		? (showPassword ? "text" : "password")
		: type

	return (
		<div className="flex flex-col mb-4">

			<label
				htmlFor={id}
				className="mb-1 text-sm font-medium text-gray-700 dark:text-[#888]"
			>
				{label}
			</label>

			<div className="relative">

				<input
					id={id}
					name={id}
					type={inputType}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					aria-required="true"
					className="
						w-full
						px-3 py-2
						border border-gray-300
						rounded-md
						text-sm
						bg-white
						text-gray-800
						placeholder:text-gray-400
						focus:outline-none
						focus:border-[#006751]
						focus:ring-2
						focus:ring-[#006751]/20
						transition
						dark:border-[#3a3a3a]
						dark:bg-[#2a2a2a]
						dark:text-[#f0ede8]
						dark:placeholder:text-[#666]
					"
				/>

				{showToggle && (
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="
							absolute right-3 top-1/2 -translate-y-1/2
							text-gray-500
							dark:text-[#aaa]
						"
						aria-label={showPassword ? "Hide password" : "Show password"}
					>
						{showPassword ? <FaEye /> : <FaEyeSlash />}
					</button>
				)}

			</div>

		</div>
	)
}

export default FormInput
