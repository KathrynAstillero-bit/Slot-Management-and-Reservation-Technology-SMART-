export function passwordChecks(value = "") {
  const longEnough = value.length >= 12;
  const hasUppercase = /[A-Z]/.test(value);
  const hasNumberOrSymbol = /[0-9]|[^\p{L}\p{N}\s]/u.test(value);
  return {
    longEnough,
    hasUppercase,
    hasNumberOrSymbol,
    valid: longEnough && hasUppercase && hasNumberOrSymbol,
  };
}
