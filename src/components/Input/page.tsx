'use client'
import { useState } from 'react'
import Image from 'next/image'
import style from './page.module.scss'

interface Props {
  type: string
  placeholder: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function Input({ type, placeholder, label, value, onChange }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={style.form__group}>
      <input
        type={inputType}
        className={style.form__field}
        placeholder={placeholder || ' '}
        value={value}
        onChange={onChange}
      />
      <label className={style.form__label}>{label}</label>

      {isPassword && (
        <button
          type="button"
          className={style.toggle}
          onClick={() => setShowPassword(prev => !prev)}
        >
          <Image
            src={showPassword ? '/openedEyes.svg' : '/closedEyes.svg'}
            alt="toggle senha"
            width={20}
            height={20}
          />
        </button>
      )}
    </div>
  )
}