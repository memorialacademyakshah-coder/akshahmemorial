'use client'
import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-black text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-10">ASMA Admin</h2>

      <nav className="flex flex-col gap-4">
        <Link href="/admin/dashboard">Dashboard</Link>
        <Link href="/admin/website">Website</Link>
        <Link href="/admin/courses">Courses</Link>
        <Link href="/admin/franchises">Franchises</Link>
        <Link href="/admin/enquiries">Enquiries</Link>
      </nav>
    </aside>
  )
}
