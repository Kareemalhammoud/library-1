import styles from './Button.module.css'

function Button({ children, variant = 'primary', size = 'md', disabled = false, onClick, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={[styles.button, styles[variant], styles[size]].join(' ')}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
