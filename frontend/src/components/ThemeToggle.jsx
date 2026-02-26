import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ showLabel = true }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="flex items-center gap-2.5">
      {showLabel && (
        <span className="font-mono text-[0.62rem] tracking-[0.12em] uppercase text-muted-custom min-w-[30px]">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}

      <button
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        className="toggle-btn relative w-11 h-6 rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        style={{
          background: isDark ? 'var(--accent)' : 'var(--border)',
          borderColor: isDark ? 'var(--accent)' : 'var(--border)',
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] shadow-md transition-transform duration-300"
          style={{
            background: 'var(--bg-card)',
            transform: isDark ? 'translateX(20px)' : 'translateX(0)',
          }}
        >
          {isDark ? '🌙' : '☀️'}
        </span>
      </button>
    </div>
  )
}
