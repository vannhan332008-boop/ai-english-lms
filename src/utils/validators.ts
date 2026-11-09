/**
 * Form validators for email, passwords, phone numbers and required text
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export const isValidPhoneVi = (phone: string): boolean => {
  // Vietnamese standard: 10 digits starting with 03, 05, 07, 08, 09
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
  const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '')
  return phoneRegex.test(cleanPhone)
}

export interface PasswordStrength {
  score: number // 0 to 4
  label: 'Yếu' | 'Trung bình' | 'Tốt' | 'Mạnh'
  color: string
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0
  if (!password) return { score: 0, label: 'Yếu', color: 'bg-rose-500' }

  if (password.length >= 6) score += 1
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1

  switch (score) {
    case 1:
      return { score: 1, label: 'Yếu', color: 'bg-rose-500' }
    case 2:
      return { score: 2, label: 'Trung bình', color: 'bg-amber-500' }
    case 3:
      return { score: 3, label: 'Tốt', color: 'bg-primary' }
    case 4:
    default:
      return { score: 4, label: 'Mạnh', color: 'bg-emerald-500' }
  }
}

export const validateRequired = (val: string, fieldName: string): string | null => {
  if (!val || !val.trim()) {
    return `${fieldName} không được để trống.`
  }
  return null
}

