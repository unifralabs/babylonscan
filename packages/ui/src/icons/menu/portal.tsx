import { SVGProps } from 'react'

export function MenuWalletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      {...props}
    >
      <path
        d="M19.5 7h-15a2 2 0 00-2 2v9a2 2 0 002 2h15a2 2 0 002-2V9a2 2 0 00-2-2zM16.5 4l-9 .004V7M17 13.5h2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
