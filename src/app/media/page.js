"use client"
import { useState, useEffect } from "react"
import { Upload, Trash2, Video, Loader2 } from "lucide-react"

export default function MediaPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [file, setFile] = useState(null)
  const [error, setError] = useState("")

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/videos`)
      const data = await res.json()
      if (data.success) {
        setVideos(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch videos", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a video file")
      return
    }

    setUploading(true)
    setError("")

    const formData = new FormData()
    formData.append("title", title)
    formData.append("video", file)

    try {
      const token = localStorage.getItem("admin_token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/videos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        setTitle("")
        setFile(null)
        // Reset file input
        document.getElementById("video-upload").value = ""
        fetchVideos()
      } else {
        setError(data.message || "Upload failed")
      }
    } catch (err) {
      setError("An error occurred during upload")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const token = localStorage.getItem("admin_token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/videos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()

      if (data.success) {
        setVideos(videos.filter((v) => v._id !== id))
      } else {
        alert(data.message || "Failed to delete video")
      }
    } catch (err) {
      console.error(err)
      alert("An error occurred")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] mb-2">Video Gallery</h1>
        <p className="text-[var(--muted-foreground)] font-medium">Manage promotional videos for the website.</p>
      </div>

      <div className="glass-panel premium-shadow rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 text-[var(--foreground)]">Upload New Video</h2>
        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
        <form onSubmit={handleUpload} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium mb-1">Video Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--sidebar)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all shadow-sm text-sm"
                placeholder="e.g., Making of Roti"
                required
              />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Video File (mp4, webm)</label>
              <input
                id="video-upload"
                type="file"
                accept="video/mp4,video/webm,video/mkv,video/avi"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full px-4 py-2.5 bg-[var(--sidebar)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all shadow-sm text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/20"
                required
              />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center justify-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video._id} className="glass-panel premium-shadow rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <video
              src={`${process.env.NEXT_PUBLIC_API_URL}${video.url}`}
              controls
              className="w-full h-48 object-cover bg-black"
            />
            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">{video.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(video._id)}
                className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                title="Delete Video"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {videos.length === 0 && (
          <div className="col-span-full py-12 text-center text-[var(--muted-foreground)] border-2 border-dashed border-[var(--border)] rounded-xl">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No videos uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
