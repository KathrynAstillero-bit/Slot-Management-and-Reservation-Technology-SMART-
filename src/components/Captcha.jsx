import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import "./Captcha.css";

function newChallenge() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = crypto.getRandomValues(new Uint8Array(12));
  return {
    text: Array.from(
      values.slice(0, 6),
      (value) => alphabet[value % alphabet.length],
    ).join(""),
    rotations: Array.from(values.slice(6), (value) => (value % 27) - 13),
  };
}

export default function CaptchaChallenge({ id, onVerify }) {
  const [challenge, setChallenge] = useState(newChallenge);
  const [answer, setAnswer] = useState("");
  const matches = answer.toUpperCase() === challenge.text;
  const wrong = answer.length === 6 && !matches;
  const pattern = Array.from(challenge.text, (character) =>
    /[A-Z]/.test(character)
      ? "[" + character + character.toLowerCase() + "]"
      : character,
  ).join("");
  function refresh() {
    setChallenge(newChallenge());
    setAnswer("");
    onVerify(false);
  }
  return (
    <fieldset className="captcha-challenge">
      <legend>Security check</legend>
      <div className="captcha-challenge-image-row">
        <svg
          className="captcha-challenge-image"
          viewBox="0 0 240 76"
          role="img"
          aria-label="CAPTCHA challenge: type the six characters shown in this image"
        >
          <rect
            width="240"
            height="76"
            rx="10"
            fill="var(--captcha-image-surface)"
          />
          {Array.from({ length: 30 }, (_, index) => (
            <circle
              key={index}
              cx={(index * 43 + 11) % 240}
              cy={(index * 29 + 9) % 76}
              r="1.2"
              fill="var(--captcha-dot)"
              opacity=".5"
            />
          ))}
          <path
            d="M0 25 Q65 72 122 24 T240 39 M0 61 Q76 11 160 46 T240 19"
            fill="none"
            stroke="var(--captcha-line)"
            strokeWidth="1.4"
            opacity=".6"
          />
          {Array.from(challenge.text, (character, index) => (
            <text
              key={index}
              x={23 + index * 36}
              y={48 + (index % 2 ? 4 : -3)}
              textAnchor="middle"
              transform={
                "rotate(" +
                challenge.rotations[index] +
                " " +
                (23 + index * 36) +
                " 39)"
              }
              fill={index % 2 ? "var(--captcha-accent)" : "var(--captcha-ink)"}
              fontFamily="Georgia, serif"
              fontWeight="bold"
              fontStyle={index % 2 ? "italic" : "normal"}
              fontSize="34"
            >
              {character}
            </text>
          ))}
          <path
            d="M0 39 Q80 22 150 49 T240 31"
            fill="none"
            stroke="var(--captcha-line)"
            strokeWidth="1.3"
            opacity=".65"
          />
        </svg>
        <button
          className="captcha-challenge-refresh"
          type="button"
          onClick={refresh}
          aria-label="Get a new CAPTCHA"
          title="Get a new CAPTCHA"
        >
          <RefreshCw size={19} />
        </button>
      </div>
      <label htmlFor={id}>Enter the characters shown</label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        required
        minLength={6}
        maxLength={6}
        pattern={pattern}
        title="Enter the six characters in the CAPTCHA image."
        placeholder="Type the 6 characters"
        aria-describedby={id + "-hint"}
        aria-invalid={wrong || undefined}
        value={answer}
        onChange={(event) => {
          setAnswer(event.target.value);
          onVerify(event.target.value.toUpperCase() === challenge.text);
        }}
      />
      <p
        id={id + "-hint"}
        className={wrong ? "captcha-challenge-error" : ""}
        aria-live="polite"
      >
        {wrong
          ? "That doesn’t match. Try again or get a new image."
          : matches
            ? "CAPTCHA matched."
            : "Letters and numbers. Uppercase or lowercase is fine."}
      </p>
    </fieldset>
  );
}
