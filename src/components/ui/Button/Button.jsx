import PropTypes from 'prop-types'

const variantClasses = {
  primary:
    'border border-transparent bg-[#1a6644] text-white shadow-[0_1px_3px_rgba(26,102,68,0.3)] hover:bg-[#14533a] dark:bg-[#1a6644] dark:text-white dark:hover:bg-[#14533a]',
  secondary:
    'border border-[#d0ddd8] bg-[#EDF3F0] text-[#1C2B24] hover:bg-[#d0ddd8] dark:border-[#333333] dark:bg-[#1f1f1f] dark:text-[#f5f7f6] dark:hover:bg-[#242424]',
  ghost:
    'border border-transparent bg-transparent text-[#006751] hover:bg-[#EDF3F0] dark:text-[#5ecba1] dark:hover:bg-[#1f1f1f]',
}

const sizeClasses = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className,
      ].join(' ')}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
}

export default Button
