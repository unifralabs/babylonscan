'use client'

import React, { useState } from 'react'

import { Input } from '../common/input'

interface FourDigitCodeInputProps {
  onComplete: (code: string) => void
}

const FourDigitCodeInput: React.FC<FourDigitCodeInputProps> = ({
  onComplete,
}) => {
  const [code, setCode] = useState(['', '', '', ''])

  const handleChange = (value: string, index: number) => {
    const newCode = [...code]
    newCode[index] = value.replace(/\D/g, '') // Allow only digits
    setCode(newCode)

    // Move to the next input if the current one is filled
    if (value && index < 3) {
      const nextInput = document.getElementById(`digit-${index + 1}`)
      nextInput?.focus()
    }

    // Call onComplete when all digits are filled
    if (newCode.every(digit => digit)) {
      onComplete(newCode.join(''))
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = event.clipboardData.getData('Text').replace(/\D/g, '') // Get only digits
    if (pastedData.length === 4) {
      const newCode = pastedData.split('')
      setCode(newCode)
      newCode.forEach((_, index) => {
        const input = document.getElementById(`digit-${index}`)
        input?.focus()
      })
      onComplete(newCode.join(''))
    }
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <div className="flex-c gap-6">
      {code.map((digit, index) => (
        <Input
          key={index}
          id={`digit-${index}`}
          type="text"
          value={digit}
          onChange={e => handleChange(e.target.value, index)}
          onPaste={handlePaste}
          onKeyDown={e => handleKeyDown(e, index)}
          maxLength={1}
          className="border-border-light focus:border-border bg-secondary h-20 w-20 rounded-lg border text-center text-3xl font-semibold focus:outline-none"
        />
      ))}
    </div>
  )
}

export default FourDigitCodeInput
