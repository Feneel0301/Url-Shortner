import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const BASE_API = 'http://localhost:5000'

export default function Dashboard() {
  const { email, token, logout } = useAuth()
  const [originalUrl, setOriginalUrl] = useState('')
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)   // tracks which URL was just copied

  useEffect(() => {
    fetchUrls()
  }, [token])

  // helper so you don't repeat the auth header everywhere
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const fetchUrls = async () => {
    try {
      const res = await fetch(`${BASE_API}/api/urls`, {
        headers: authHeaders
      })
      const data = await res.json()
      setUrls(data)
    } catch (err) {
      console.error('Failed to fetch URLs', err)
    }
  }

  const handleShorten = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${BASE_API}/api/urls`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ originalUrl })
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.message)
        return
      }

      setOriginalUrl('')
      fetchUrls()
    } catch (err) {
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this link?')) return
    try {
      await fetch(`${BASE_API}/api/urls/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      })
      fetchUrls()
    } catch (err) {
      alert('Failed to delete')
    }
  }

  const handleCopy = (shortCode) => {
    navigator.clipboard.writeText(`${BASE_API}/${shortCode}`)
    setCopied(shortCode)
    setTimeout(() => setCopied(null), 2000)   // reset after 2s
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.logo}>Shortly</span>
        <div style={styles.headerRight}>
          <span style={styles.emailText}>{email}</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.container}>
        <h2 style={styles.heading}>Shorten a link</h2>

        {/* Shorten form */}
        <form onSubmit={handleShorten} style={styles.form}>
          <input
            type="url"
            value={originalUrl}
            onChange={e => setOriginalUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.shortenBtn}>
            {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </form>

        {/* URL list */}
        <div style={styles.list}>
          {urls.length === 0 && (
            <p style={styles.empty}>No links yet. Shorten your first URL above.</p>
          )}

          {urls.map(url => (
            <div key={url._id} style={styles.urlCard}>
              <div style={styles.urlInfo}>
                <a
                  href={`${BASE_API}/${url.shortCode}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.shortLink}
                >
                  localhost:5000/{url.shortCode}
                </a>
                <p style={styles.originalUrl}>
                  {url.originalUrl.length > 70
                    ? url.originalUrl.slice(0, 70) + '...'
                    : url.originalUrl}
                </p>
                <p style={styles.clicks}>{url.clicks} clicks</p>
              </div>

              <div style={styles.actions}>
                <button
                  onClick={() => handleCopy(url.shortCode)}
                  style={styles.copyBtn}
                >
                  {copied === url.shortCode ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => handleDelete(url._id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  header: {
    background: '#fff',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee'
  },
  logo: { fontSize: 22, fontWeight: 700, color: '#2563eb' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  emailText: { fontSize: 14, color: '#666' },
  logoutBtn: {
    padding: '8px 16px',
    fontSize: 14,
    border: '1px solid #ddd',
    borderRadius: 8,
    background: '#fff',
    cursor: 'pointer'
  },
  container: { maxWidth: 700, margin: '40px auto', padding: '0 20px' },
  heading: { fontSize: 22, fontWeight: 700, marginBottom: 20 },
  form: { display: 'flex', gap: 10, marginBottom: 32 },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: 15,
    border: '1px solid #ddd',
    borderRadius: 8,
    outline: 'none'
  },
  shortenBtn: {
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  empty: { color: '#999', textAlign: 'center', marginTop: 40 },
  urlCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  },
  urlInfo: { flex: 1, marginRight: 16 },
  shortLink: { fontSize: 15, fontWeight: 600, color: '#2563eb', textDecoration: 'none' },
  originalUrl: { fontSize: 13, color: '#888', marginTop: 4 },
  clicks: { fontSize: 12, color: '#aaa', marginTop: 4 },
  actions: { display: 'flex', gap: 8 },
  copyBtn: {
    padding: '8px 14px',
    fontSize: 13,
    border: '1px solid #2563eb',
    color: '#2563eb',
    background: '#fff',
    borderRadius: 6,
    cursor: 'pointer',
    minWidth: 64
  },
  deleteBtn: {
    padding: '8px 14px',
    fontSize: 13,
    border: '1px solid #ddd',
    color: '#dc2626',
    background: '#fff',
    borderRadius: 6,
    cursor: 'pointer'
  }
}