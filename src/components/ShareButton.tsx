'use client'

interface Props {
  id: string
}

export default function ShareButton({ id }: Props) {
  const handleShare = async () => {
    const url = `${window.location.origin}/result/${id}`
    try {
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    } catch {
      prompt('Copy this link:', url)
    }
  }

  return (
    <button onClick={handleShare} className="btn-primary flex-1">
      Share this Verdict
    </button>
  )
}
