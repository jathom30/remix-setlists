import { motion } from "framer-motion"
import type { passwordStrength } from "~/utils/assorted"
import { FlexList } from "./FlexList"

export const PasswordStrength = ({ tests, strength }: { tests: ReturnType<typeof passwordStrength>['tests']; strength: number }) => {

  const testsCount = Object.values(tests)

  const width = strength / testsCount.length * 100

  const message = () => {
    if (!tests.minCharacters) return 'Password must be at least 8 characters'
    if (!(tests.includesNumbers || tests.includesSpecialCharacters)) return 'Password must include at least 1 number and special character'
    if (!tests.includesNumbers) return 'Password must include at least 1 number'
    if (!tests.includesSpecialCharacters) return 'Password must include at least 1 special character'
    if (!tests.includesLetters) return 'Password must include at least 1 letter'
    return 'This is a masterclass in password creation'
  }

  const color = () => {
    switch (strength) {
      case 1:
        return 'rgb(239, 68, 68)';
      case 2:
        return 'rgb(234, 179, 8)';
      case 3:
        return 'rgb(59, 130, 246)';
      case 4:
        return 'rgb(34, 197, 94)';
      default:
        return 'rgb(100, 116, 139)';
    }
  }

  return (
    <FlexList gap={0}>
      <div className="h-4 bg-base-100 rounded overflow-hidden">
        <motion.div animate={{ width: `${width}%`, background: color() }} className="h-full w-1/2 bg-base-200" />
      </div>
      <span className="text-sm">{message()}</span>
    </FlexList>
  )
}
