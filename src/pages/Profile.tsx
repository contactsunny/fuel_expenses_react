export default function Profile() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  })()
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Profile</h2>
      <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-4">
        <img src={user?.imageUrl || '/icons/icon-128x128.png'} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
        <div>
          <div className="font-medium">{user?.name || 'User'}</div>
          <div className="text-slate-500 text-sm">{user?.email || ''}</div>
        </div>
      </div>
    </div>
  )
}


