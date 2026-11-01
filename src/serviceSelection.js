export function selectedServiceIds(office, body) {
  const input =
    body.serviceIds === undefined ? [body.serviceId] : body.serviceIds;
  if (
    !Array.isArray(input) ||
    !input.length ||
    input.some((id) => typeof id !== "string")
  )
    throw new Error("Select at least one service.");
  const ids = [...new Set(input)];
  if (
    !office?.enabled ||
    ids.some((id) => !office.services.some((s) => s.id === id && s.enabled))
  )
    throw new Error("A selected service is unavailable. Review your services.");
  return ids;
}
