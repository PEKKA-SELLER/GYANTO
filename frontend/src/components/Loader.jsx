const Loader = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`${sizes[size]} rounded-full border-brand-500/30 border-t-brand-500 animate-spin`}
      />
      {text && <p className="text-white/50 text-sm">{text}</p>}
    </div>
  )
}

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader size="lg" text="Loading..." />
  </div>
)

export default Loader
