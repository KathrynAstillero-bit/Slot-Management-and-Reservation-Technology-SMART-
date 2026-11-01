const normalize = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const ignored = new Set(
  "a an the how do does i my me can could to for of in on is are it what where when why please and".split(
    " ",
  ),
);
const aliases = {
  book: ["reserve", "reservation", "booking", "appointment"],
  cancel: ["cancelled", "cancelling", "cancellation", "delete", "remove"],
  unavailable: [
    "closed",
    "closure",
    "blocked",
    "emergency",
    "gray",
    "grey",
    "full",
  ],
  ticket: ["qr", "token", "verification"],
  account: ["login", "signin", "access"],
  queue: ["number", "line"],
};
function variants(token) {
  for (const [key, values] of Object.entries(aliases))
    if (key === token || values.includes(token)) return [key, ...values];
  return [token];
}
export function searchHelp(faqs, query, category = "All") {
  const words = [
    ...new Set(
      normalize(query)
        .split(" ")
        .filter((word) => word && !ignored.has(word)),
    ),
  ];
  return faqs
    .filter((faq) => category === "All" || faq.category === category)
    .map((faq, index) => {
      const title = normalize(faq.title),
        body = normalize(
          faq.category + " " + faq.answer + " " + (faq.keywords || ""),
        );
      let score = 0;
      const matches = words.every((word) => {
        const forms = variants(word);
        if (title.includes(word)) {
          score += 5;
          return true;
        }
        if (body.includes(word)) {
          score += 2;
          return true;
        }
        if (forms.some((form) => title.includes(form) || body.includes(form))) {
          score++;
          return true;
        }
        return false;
      });
      return { faq, index, score, matches };
    })
    .filter((item) => item.matches)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.faq);
}
