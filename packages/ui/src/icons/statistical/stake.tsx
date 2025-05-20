import { SVGProps } from 'react'

export function StakeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="25"
      height="22"
      viewBox="0 0 25 22"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      fill="none"
      {...props}
    >
      <path
        d="M23.6667 6.34035L12.6667 10.8204L1.66666 6.34035L12.6667 1.86035L23.6667 6.34035Z"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.6667 11L12.6667 15.48L1.66666 11"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.6667 15.6602L12.6667 20.1402L1.66666 15.6602"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
