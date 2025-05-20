import { SVGProps } from 'react'

export function KeystoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M30 25H90L50 110H20L30 25Z" fill="black" />
      <path d="M130 135L70 135L110 50L140 50L130 135Z" fill="#F5870A" />
    </svg>
  )
}
