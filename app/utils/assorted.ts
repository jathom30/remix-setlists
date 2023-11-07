export const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const generateRandomHex = () =>
  "000000".replace(/0/g, function () {
    return (~~(Math.random() * 16)).toString(16);
  });

export function contrastColor(hex: string) {
  let cleanedHex = hex.indexOf("#") === 0 ? hex.slice(1) : hex;
  // convert 3-digit hex to 6-digits.
  if (cleanedHex.length === 3) {
    cleanedHex =
      cleanedHex[0] +
      cleanedHex[0] +
      cleanedHex[1] +
      cleanedHex[1] +
      cleanedHex[2] +
      cleanedHex[2];
  }
  if (cleanedHex.length !== 6) {
    throw new Error("Invalid HEX color");
  }
  const r = parseInt(cleanedHex.slice(0, 2), 16),
    g = parseInt(cleanedHex.slice(2, 4), 16),
    b = parseInt(cleanedHex.slice(4, 6), 16);
  // https://stackoverflow.com/a/3943023/112731
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
}

export const passwordStrength = (password: string) => {
  const minCharacters = password.length >= 8;
  const includesLetters = /[a-zA-Z]/g.test(password);
  const includesNumbers = /\d/.test(password);
  const includesSpecialCharacters =
    /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password);

  const strength = !minCharacters
    ? 1
    : [
        minCharacters,
        includesLetters,
        includesNumbers,
        includesSpecialCharacters,
      ].reduce((acc, cur) => {
        if (!cur) return acc;
        return (acc += 1);
      }, 0);

  return {
    tests: {
      minCharacters,
      includesLetters,
      includesNumbers,
      includesSpecialCharacters,
    },
    strength,
  };
};

export const getPasswordError = (
  tests: ReturnType<typeof passwordStrength>["tests"],
) => {
  if (!tests.minCharacters) return "Password must be at least 8 characters";
  if (!(tests.includesNumbers || tests.includesSpecialCharacters))
    return "Password must include at least 1 number and special character";
  if (!tests.includesNumbers) return "Password must include at least 1 number";
  if (!tests.includesSpecialCharacters)
    return "Password must include at least 1 special character";
  if (!tests.includesLetters) return "Password must include at least 1 letter";
};

/**
 * @returns domain URL (without a ending slash, like: https://kentcdodds.com)
 */
export function getDomainUrl(request: Request) {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");
  if (!host) {
    throw new Error("Could not determine domain URL.");
  }
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}
