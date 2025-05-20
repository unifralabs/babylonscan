import { SVGProps } from 'react'

export function WarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="39"
      height="40"
      viewBox="0 0 39 40"
      xmlns="http://www.w3.org/2000/svg"
      stroke="none"
      fill="currentColor"
      {...props}
    >
      <path d="M27.5817 0.5H11.4183L0 11.9183V28.0817L11.4183 39.5H27.5817L39 28.0817V11.9183L27.5817 0.5ZM19.5 31.4833C17.94 31.4833 16.6833 30.2267 16.6833 28.6667C16.6833 27.1067 17.94 25.85 19.5 25.85C21.06 25.85 22.3167 27.1067 22.3167 28.6667C22.3167 30.2267 21.06 31.4833 19.5 31.4833ZM21.6667 22.1667H17.3333V9.16667H21.6667V22.1667Z" />
    </svg>
  )
}
