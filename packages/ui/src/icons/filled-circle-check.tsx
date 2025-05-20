import { SVGProps } from 'react'

export function FilledCircleCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm-1.707 17.707l-4.586-4.586 1.414-1.414 3.172 3.172 7.07-7.07 1.414 1.414-8.484 8.484z" />
    </svg>
  )
}
