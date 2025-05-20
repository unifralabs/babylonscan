import { SVGProps } from 'react'

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="20"
      viewBox="0 0 22 24"
      xmlns="http://www.w3.org/2000/svg"
      stroke="none"
      fill="currentColor"
      {...props}
    >
      <circle cx="11" cy="6" r="6" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.542542 20.1099C2.6013 16.4626 6.51305 14 11 14C15.4869 14 19.3986 16.4626 21.4574 20.1099C18.6529 22.5339 14.9977 24 11 24C7.00227 24 3.347 22.5339 0.542542 20.1099Z"
      />
    </svg>
  )
}
