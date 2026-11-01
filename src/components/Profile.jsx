import "./Profile.css";
import React, { useState, useEffect } from "react";
import { Camera, Check } from "lucide-react";

export default function Profile({
  profile,
  email,
  setProfile,
  photo,
  onPhotoChange,
  notify,
}) {
  const [draft, setDraft] = useState(profile);
  useEffect(() => {
    setDraft({
      name: profile.name,
      number: profile.number,
      course: profile.course,
    });
  }, [profile.name, profile.number, profile.course]);
  function upload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1500000) {
      notify("Choose an image smaller than 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () =>
      notify("The photo could not be read. Try another image.");
    reader.onload = () => {
      const image = new Image();
      image.onerror = () =>
        notify("This image could not be opened. Choose another photo.");
      image.onload = () => {
        if (onPhotoChange(reader.result)) notify("Profile photo updated.");
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
  return (
    <div className="profile-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR STUDENT DETAILS</div>
          <h1>Student Profile</h1>
          <p className="page-subtitle">Your details for appointment tickets.</p>
        </div>
      </div>
      <form
        className="panel profile-panel"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await setProfile(draft)) notify("Profile saved.");
        }}
      >
        <div className="profile-photo-row">
          <div className="profile-avatar">
            {photo ? <img src={photo} alt="Student profile" /> : draft.name[0]}
          </div>
          <label className="button secondary">
            <Camera size={16} />
            Upload new photo
            <input type="file" accept="image/*" onChange={upload} hidden />
          </label>
          {photo && (
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                if (onPhotoChange("")) notify("Profile photo removed.");
              }}
            >
              Remove photo
            </button>
          )}
        </div>
        <div className="field">
          <label htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            value={draft.name}
            required
            maxLength={100}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="profile-number">Student ID</label>
          <input id="profile-number" value={draft.number} readOnly />
          <small className="muted">
            This is the Student ID used for the sign-in.
          </small>
        </div>
        <div className="field">
          <label htmlFor="profile-email">Email address</label>
          <input
            id="profile-email"
            type="email"
            value={email || ""}
            readOnly
            placeholder="No email linked"
          />
          <small className="muted">Email linked to your account.</small>
        </div>
        <div className="field">
          <label htmlFor="profile-course">Course & year level</label>
          <input
            id="profile-course"
            value={draft.course}
            onChange={(e) => setDraft({ ...draft, course: e.target.value })}
          />
        </div>
        <button className="button primary">
          Save profile
          <Check size={16} />
        </button>
      </form>
    </div>
  );
}
