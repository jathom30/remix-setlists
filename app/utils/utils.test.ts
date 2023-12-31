import {
  capitalizeFirstLetter,
  generateRandomHex,
  contrastColor,
  passwordStrength,
  getPasswordError,
} from "./assorted";
import { buttonKind, buttonSize, badgeKind } from "./buttonStyles";
import { valueAsType, getFields } from "./form";
import { getSortFromParam, sortByLabel } from "./params";

// Assorted utils
describe("Assorted utils", () => {
  test("Capitalize first letter", () => {
    expect(capitalizeFirstLetter("test")).toBe("Test");
  });

  test("Generate random hex", () => {
    expect(generateRandomHex()).length(6);
  });

  test("Contrast color", () => {
    expect(contrastColor("#000000")).toBe("#FFFFFF");
    expect(contrastColor("#FFFFFF")).toBe("#000000");
    expect(contrastColor("#FF2D00")).toBe("#FFFFFF");
  });

  test("Password strength", () => {
    const badPassword = passwordStrength("short");
    expect(badPassword.strength).toBe(1);
    expect(badPassword.tests.minCharacters).toBe(false);
    expect(badPassword.tests.includesLetters).toBe(true);
    expect(badPassword.tests.includesNumbers).toBe(false);
    expect(badPassword.tests.includesSpecialCharacters).toBe(false);

    const goodPassword = passwordStrength("passw0rD!");
    expect(goodPassword.strength).toBe(4);
    expect(goodPassword.tests.minCharacters).toBe(true);
    expect(goodPassword.tests.includesLetters).toBe(true);
    expect(goodPassword.tests.includesNumbers).toBe(true);
    expect(goodPassword.tests.includesSpecialCharacters).toBe(true);
  });

  test("Get password error", () => {
    const shortPasswordTests = passwordStrength("short").tests;
    expect(getPasswordError(shortPasswordTests)).toBe(
      "Password must be at least 8 characters",
    );

    const passwordWithoutNumbersAndSpecialCharsTests =
      passwordStrength("password").tests;
    expect(getPasswordError(passwordWithoutNumbersAndSpecialCharsTests)).toBe(
      "Password must include at least 1 number and special character",
    );

    const passwordWithoutNumbersTests = passwordStrength("password!").tests;
    expect(getPasswordError(passwordWithoutNumbersTests)).toBe(
      "Password must include at least 1 number",
    );

    const passwordWithoutSpecialCharsTests =
      passwordStrength("password1").tests;
    expect(getPasswordError(passwordWithoutSpecialCharsTests)).toBe(
      "Password must include at least 1 special character",
    );

    const passwordWithoutLettersTests = passwordStrength("12345678!").tests;
    expect(getPasswordError(passwordWithoutLettersTests)).toBe(
      "Password must include at least 1 letter",
    );

    const passwordWithoutErrorsTests = passwordStrength("passw0rd!").tests;
    expect(getPasswordError(passwordWithoutErrorsTests)).toBe(undefined);
  });
});

// Button styles
describe("Button styles", () => {
  test("Button kind", () => {
    expect(buttonKind("accent")).toBe("btn-accent");
    expect(buttonKind("active")).toBe("btn-active");
  });

  test("Button size", () => {
    expect(buttonSize("sm")).toBe("btn-sm");
    expect(buttonSize("md")).toBe("btn-md");
  });

  test("Badge kind", () => {
    expect(badgeKind("accent")).toBe("badge-accent");
    expect(badgeKind("error")).toBe("badge-error");
  });
});

// Form utils
describe("Form utils", () => {
  test("Value as type", () => {
    const stringValue = valueAsType("string", "test");
    expect(stringValue).toBe("test");

    const booleanValue = valueAsType("boolean", "true");
    expect(booleanValue).toBe(true);

    const numberValue = valueAsType("number", "42");
    expect(numberValue).toBe(42);
  });

  test("Get fields", () => {
    const formData = new FormData();
    formData.set("name", "test name");

    const { fields, errors } = getFields<{ name: string; age: number }>(
      formData,
      [
        { name: "name", type: "string", isRequired: true },
        { name: "age", type: "number", isRequired: true },
      ],
    );

    expect(fields.name).toBe("test name");
    expect(errors.age).toBe("age is required");
    expect(errors.name).toBe(undefined);
  });
});

// Param utils
describe("Param utils", () => {
  test("Get sort from param", () => {
    const ageSort = getSortFromParam("age:asc");
    expect(ageSort).toStrictEqual({ age: "asc" });
    expect(getSortFromParam("")).toStrictEqual({ "": undefined });
  });

  test("Sort by label", () => {
    const searchParams = new URLSearchParams();
    searchParams.set("sort", "name:asc");
    expect(sortByLabel(searchParams)).toBe("Name A-Z");
    expect(sortByLabel("name:asc")).toBe("Name A-Z");
    expect(sortByLabel("name:desc")).toBe("Name Z-A");
    expect(sortByLabel("tempo:asc")).toBe("Tempo slow-fast");
  });
});
