import { SVGProps } from 'react'

export function ArrowUpDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="20"
      viewBox="0 0 10 20"
      xmlns="http://www.w3.org/2000/svg"
      stroke="none"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.79999 18.934C5.39999 19.4673 4.59999 19.4673 4.19999 18.934L0.199986 13.6007C-0.294441 12.9414 0.175942 12.0007 0.999987 12.0007L8.99999 12.0007C9.82403 12.0007 10.2944 12.9414 9.79999 13.6007L5.79999 18.934ZM4.19998 1.06732C4.59998 0.533983 5.39998 0.533983 5.79998 1.06732L9.79998 6.40065C10.2944 7.05989 9.82403 8.00065 8.99998 8.00065H0.999985C0.175939 8.00065 -0.294443 7.05989 0.199985 6.40065L4.19998 1.06732Z"
      />
    </svg>
  )
}
