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
				className="mb-1 text-sm text-gray-700 font-medium"
			>
				{label}
			</label>

			<div className="relative">

				<input
					id={id}
					type={inputType}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					className="
						w-full
						px-3 py-2
						border border-gray-300
						rounded-md
						text-sm
						focus:outline-none
						focus:border-[#006751]
						focus:ring-2
						focus:ring-[#006751]/20
						transition
					"
				/>

				{showToggle && (
					<span
						onClick={() => setShowPassword(!showPassword)}
						className="
							absolute right-3 top-1/2 -translate-y-1/2
							cursor-pointer text-gray-500
						"
					>
						{showPassword ? <FaEyeSlash /> : <FaEye />}
					</span>
				)}

			</div>

		</div>
	)
}

export default FormInput