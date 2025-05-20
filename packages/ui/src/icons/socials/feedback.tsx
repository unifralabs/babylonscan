import type { SVGProps } from 'react'

export function FeedbackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      stroke="none"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <title>Feedback Icon</title>
      <circle cx="9" cy="9" r="9" />
      <path
        d="M9 13.5C9.83 13.5 9.83 12 9 12C8.17 12 8.17 13.5 9 13.5ZM9 5C7.34 5 6 6.34 6 8H7.5C7.5 7.17 8.17 6.5 9 6.5C9.83 6.5 10.5 7.17 10.5 8C10.5 9.5 8.25 9.25 8.25 11.25H9.75C9.75 10 12 10 12 8C12 6.34 10.66 5 9 5Z"
        fill="white"
      />
    </svg>
  )
}
