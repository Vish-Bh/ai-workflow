import Link from "next/link";

export function NewRequestButton(){
    return <Link href="/dashboard/new-request">
  <button className="px-4 py-2 bg-blue-600 text-white rounded">
    New Request
  </button>
</Link>
}