export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const generateRandomHex = () => Math.floor(Math.random() * 16777215).toString(16)

export function contrastColor(hex: string) {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.');
  }
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  // https://stackoverflow.com/a/3943023/112731
  return (r * 0.299 + g * 0.587 + b * 0.114) > 186
    ? '#000000'
    : '#FFFFFF';
}

export const passwordStrength = (password: string) => {
  const minCharacters = password.length >= 8
  const includesLetters = /[a-zA-Z]/g.test(password)
  const includesNumbers = /\d/.test(password)
  const includesSpecialCharacters = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)

  const strength = !minCharacters ? 1 : [minCharacters, includesLetters, includesNumbers, includesSpecialCharacters].reduce((acc, cur) => {
    if (!cur) return acc
    return acc += 1
  }, 0)

  return {
    tests: {
      minCharacters,
      includesLetters,
      includesNumbers,
      includesSpecialCharacters,
    },
    strength
  }
}