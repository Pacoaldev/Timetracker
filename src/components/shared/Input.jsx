export default function Input({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
      <input
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        {...props}
      />
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </label>
  )
}
