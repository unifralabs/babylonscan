import { SVGProps } from 'react'

export function TrumpetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      stroke="none"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6936 10.75H5C4.125 10.75 3.375 10 3.375 9.125V6C3.375 5.125 4.125 4.375 5 4.375H10.4769L13.5 2.62478C14.125 2.24978 14.875 2.74978 14.875 3.37478V11.6248C14.875 12.3748 14.125 12.7498 13.5 12.3748L10.6936 10.75Z"
      />
      <path d="M16.25 9.375C17.5 9.375 17.5 8.5 17.5 7.875C17.5 7.25 17.5 6.375 16.25 6.375V9.375Z" />
      <path d="M9.125 17.5H7.5C7 17.5 6.625 17.125 6.625 16.625L5.25 11.875C5.25 11.375 5.625 11 6.125 11H7.75C8.25 11 8.625 11.375 8.625 11.875L10 16.625C10 17.125 9.625 17.5 9.125 17.5Z" />
    </svg>
  )
}
