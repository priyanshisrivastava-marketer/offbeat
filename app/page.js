"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebaseClient";
import styles from "./page.module.css";

const DURATIONS = ["2 hours", "4 hours"];

const VIBES = [
  { label: "Chill", icon: "🌿" },
  { label: "Social", icon: "🎉" },
  { label: "Adventurous", icon: "🧭" },
  { label: "Creative", icon: "🎨" },
];

const COMPANIONS = [
  { label: "Solo", icon: "🚶" },
  { label: "Friends group", icon: "👯" },
  { label: "Partner", icon: "💞" },
  { label: "Family", icon: "👨‍👩‍👧" },
];

const HEROES = [
  {
    type: "video",
    src: "/landing/hero-1.mp4",
    kicker: "Start wandering",
    title: "Find your next adventure.",
    text: "A little time. A little curiosity. One offbeat place.",
  },
  {
    type: "image",
    src: "/landing/mcleod-gang.jpg",
    kicker: "Go somewhere unexpected",
    title: "Go somewhere unexpected.",
    text: "Discover places worth stepping away for.",
  },
  {
    type: "video",
    src: "/landing/hero-2.mp4",
    kicker: "Take the scenic route",
    title: "Take the scenic route.",
    text: "Culture, stories and places hiding in plain sight.",
  },
  {
    type: "image",
    src: "/landing/himalayan-art.jpg",
    kicker: "Make time",
    title: "Make a few hours count.",
    text: "Turn spare time into a tiny adventure.",
  },
  {
    type: "video",
    src: "/landing/IMG_6846.mp4",
    kicker: "Escape for a while",
    title: "Escape, even for a while.",
    text: "Find your kind of offbeat.",
  },
  {
    type: "image",
    src: "/landing/temple.jpg",
    kicker: "Slow down",
    title: "Step off the usual path.",
    text: "There's always somewhere new to explore.",
  },
  {
    type: "image",
    src: "/landing/beach-wide.jpg",
    kicker: "Get out",
    title: "Your adventure is closer than you think.",
    text: "Explore without needing a whole day.",
  },
  {
    type: "image",
    src: "/landing/beach-shell.jpg",
    kicker: "Small moments",
    title: "Slow down. Look around.",
    text: "Find something different.",
  },
  {
    type: "image",
    src: "/landing/himalayan-view.jpg",
    kicker: "Go offbeat",
    title: "Leave the ordinary behind.",
    text: "Explore nearby places you might never have thought to visit.",
  },
];

function ticketCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function apiFetch(path, user, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (user) {
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.error) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function Logo({ small = false }) {
  return (
    <img
      className={small ? styles.miniBrand : styles.brand}
      src="/brand/offbeat-mark.png"
      alt="Offbeat"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

function GoogleIcon() {
  return (
    <svg
      className={styles.googleIcon}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 19-9 19-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.4 35.1 26.9 36 24 36c-5.2 0-9.5-3.3-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.9 5.4-7.3 6.6l6.3 5.2C38 36.6 43 31 43 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function GoogleButton({ onError, compact = false }) {
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      onError?.(
        error?.message || "Google sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={compact ? styles.google : styles.primary}
      onClick={login}
      disabled={loading}
      type="button"
    >
      <GoogleIcon />
      <span>{loading ? "Opening Google…" : "Continue with Google"}</span>
    </button>
  );
}

function HeroMedia({ hero, className, onError }) {
  if (hero.type === "video") {
    return (
      <video
        className={className}
        src={hero.src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onError={onError}
      />
    );
  }

  return (
    <img
      className={className}
      src={hero.src}
      alt=""
      draggable="false"
      onError={onError}
    />
  );
}

function Landing({ onGuest }) {
  const [slide, setSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((current) => {
        const next = (current + 1) % HEROES.length;

        setPreviousSlide(current);
        setIsTransitioning(true);

        window.setTimeout(() => {
          setPreviousSlide(null);
          setIsTransitioning(false);
        }, 900);

        return next;
      });
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const changeSlide = (nextSlide) => {
    if (nextSlide === slide || isTransitioning) {
      return;
    }

    setPreviousSlide(slide);
    setSlide(nextSlide);
    setIsTransitioning(true);

    window.setTimeout(() => {
      setPreviousSlide(null);
      setIsTransitioning(false);
    }, 900);
  };

  const hero = HEROES[slide];
  const previousHero =
    previousSlide !== null ? HEROES[previousSlide] : null;

  const handleMediaError = (event) => {
    event.currentTarget.style.opacity = "0";
  };

  return (
    <main className={styles.landing}>
      <div className={styles.landingInner}>
        <div className={styles.topbar}>
          <Logo />
          <span className={styles.topLink}>For curious people</span>
        </div>

        <section
          className={styles.hero}
          aria-label="Offbeat travel inspiration"
        >
          <div className={styles.heroMedia}>
            {previousHero && (
              <HeroMedia
                hero={previousHero}
                className={`${styles.heroImage} ${styles.heroImagePrevious}`}
                onError={handleMediaError}
              />
            )}

            <HeroMedia
              hero={hero}
              className={`${styles.heroImage} ${styles.heroImageCurrent}`}
              onError={handleMediaError}
            />
          </div>

          <div className={styles.heroShade} />

          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              ✦ {hero.kicker}
            </span>

            <h1 className={styles.heroTitle}>{hero.title}</h1>

            <p className={styles.heroText}>{hero.text}</p>

            <div className={styles.dots}>
              {HEROES.map((item, index) => (
                <button
                  key={item.src}
                  type="button"
                  className={`${styles.dot} ${
                    index === slide ? styles.dotActive : ""
                  }`}
                  onClick={() => changeSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={index === slide ? "true" : undefined}
                  disabled={isTransitioning}
                />
              ))}
            </div>
          </div>
        </section>

        <div className={styles.walk} aria-hidden="true">
          <span className={styles.walkStep}>👟</span>
          <span className={styles.walkStep}>👟</span>
          <span className={styles.walkStep}>👟</span>
          <span className={styles.walkStep}>👟</span>
          <span className={styles.walkLine} />
          <span>take the next step</span>
        </div>

        <div className={styles.ctaRow}>
          <GoogleButton onError={setAuthError} />

          <button
            className={styles.secondary}
            onClick={onGuest}
            type="button"
          >
            Explore without signing in
          </button>
        </div>

        {authError && (
          <p className={styles.error}>{authError}</p>
        )}

        <p className={styles.trust}>
          🔒 Your sign-in is only used to save your profile and adventures.
          Guest mode does not save anything.
        </p>
      </div>
    </main>
  );
}

function AuthGate({ user, onDone }) {
  const [name, setName] = useState(user.displayName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    const cleanName = name.trim();

    if (!cleanName) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/api/profile", user, {
        method: "POST",
        body: JSON.stringify({
          name: cleanName,
        }),
      });

      onDone(
        data.profile || {
          name: cleanName,
          email: user.email || "",
          photoURL: user.photoURL || "",
        }
      );
    } catch (err) {
      setError(
        err?.message || "Could not save your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.authCard}>
      <div className={styles.authInner}>
        <Logo />

        <p className={styles.hello}>
          One tiny detail before you go.
        </p>

        <div className={styles.panel}>
          <label className={styles.label} htmlFor="name">
            What should Offbeat call you?
          </label>

          <input
            id="name"
            className={`${styles.input} ${styles.profileInput}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) =>
              event.key === "Enter" && save()
            }
            placeholder="e.g. Priya"
            autoFocus
          />

          <button
            className={styles.generate}
            onClick={save}
            disabled={loading}
            type="button"
          >
            {loading ? "Saving..." : "Let's go"}
          </button>

          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    </main>
  );
}

function CompletedTab({ user, refreshKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    apiFetch("/api/completed", user)
      .then((data) => {
        if (active) {
          setItems(data.items || []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err?.message || "Could not load completed adventures."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user, refreshKey]);

  if (loading) {
    return (
      <div className={styles.empty}>
        Loading your adventures...
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!items.length) {
    return (
      <div className={styles.empty}>
        🗺️
        <br />
        No adventures completed yet.
      </div>
    );
  }

  return (
    <div>
      {items.map((adventure) => (
        <article
          className={styles.ticket}
          key={adventure.id}
        >
          <div className={styles.ticketTop}>
            <div className={styles.ticketCode}>
              COMPLETED · {adventure.city}
            </div>

            <h2 className={styles.ticketTitle}>
              {adventure.title}
            </h2>
          </div>

          <div className={styles.stops}>
            {(adventure.stops || []).map((stop, index) => (
              <div
                className={styles.stop}
                key={`${stop.name}-${index}`}
              >
                <span className={styles.stopNum}>
                  {index + 1}
                </span>

                <strong>{stop.name}</strong>

                <br />

                <a
                  className={styles.map}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${stop.name}, ${adventure.city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Maps ↗
                </a>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function Generator({ user, profile, onLogout }) {
  const [tab, setTab] = useState("new");
  const [city, setCity] = useState(profile?.defaultCity || "");
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [vibe, setVibe] = useState(
    profile?.favoriteVibe || VIBES[0].label
  );
  const [companion, setCompanion] = useState(
    profile?.favoriteCompanion || COMPANIONS[0].label
  );
  const [adventure, setAdventure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);
  const [completedRefresh, setCompletedRefresh] = useState(0);
  const code = useMemo(ticketCode, []);

  const generate = async () => {
    if (!city.trim()) {
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setAdventure(null);
    setJustCompleted(false);

    try {
      const placesData = await apiFetch("/api/places", user, {
        method: "POST",
        body: JSON.stringify({
          city,
          vibe,
        }),
      });

      const advData = await apiFetch("/api/adventure", user, {
        method: "POST",
        body: JSON.stringify({
          city,
          duration,
          vibe,
          companion,
          places: placesData.places,
        }),
      });

      setAdventure(advData.adventure);

      if (user) {
        try {
          await apiFetch("/api/profile", user, {
            method: "POST",
            body: JSON.stringify({
              name: profile?.name || user.displayName || "",
              defaultCity: city,
              favoriteVibe: vibe,
              favoriteCompanion: companion,
            }),
          });
        } catch (err) {
          console.warn("Could not sync preferences", err);
        }
      }
    } catch (err) {
      setErrorMsg(
        err?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async () => {
    if (!user || !adventure || justCompleted) {
      return;
    }

    setErrorMsg("");

    try {
      await apiFetch("/api/completed", user, {
        method: "POST",
        body: JSON.stringify({
          title: adventure.title,
          city,
          vibe,
          companion,
          stops: adventure.stops,
        }),
      });

      setJustCompleted(true);
      setCompletedRefresh((value) => value + 1);
    } catch (err) {
      setErrorMsg(
        err?.message ||
          "Could not save this adventure right now. Please try again."
      );
    }
  };

  return (
    <main className={styles.generatorWrap}>
      <div className={styles.generator}>
        <header className={styles.appHeader}>
          <Logo small />

          <div>
            <div className={styles.hello}>
              {user
                ? `Hi, ${
                    profile?.name ||
                    user.displayName ||
                    "there"
                  }`
                : "Guest mode"}
            </div>

            {user && (
              <button
                className={styles.signout}
                onClick={onLogout}
                type="button"
              >
                Sign out
              </button>
            )}
          </div>
        </header>

        {user && (
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                tab === "new" ? styles.tabActive : ""
              }`}
              onClick={() => setTab("new")}
              type="button"
            >
              New Adventure
            </button>

            <button
              className={`${styles.tab} ${
                tab === "completed"
                  ? styles.tabActive
                  : ""
              }`}
              onClick={() => setTab("completed")}
              type="button"
            >
              Completed
            </button>
          </div>
        )}

        {tab === "completed" && user ? (
          <CompletedTab
            user={user}
            refreshKey={completedRefresh}
          />
        ) : (
          <>
            <section className={styles.panel}>
              <span
                className={styles.eyebrow}
                style={{
                  background: "#17191d",
                  color: "#fff",
                }}
              >
                ✦ Build a little adventure
              </span>

              <h1 className={styles.ticketTitle}>
                Where are you going?
              </h1>

              <p className={styles.ticketSub}>
                Give Offbeat a city, a mood and a little
                time. We will handle the rest.
              </p>

              <div className={styles.section}>
                <label
                  className={styles.label}
                  htmlFor="city"
                >
                  City
                </label>

                <input
                  id="city"
                  className={styles.input}
                  value={city}
                  onChange={(event) =>
                    setCity(event.target.value)
                  }
                  placeholder="Mumbai, Delhi, Jaipur..."
                  onKeyDown={(event) =>
                    event.key === "Enter" && generate()
                  }
                />
              </div>

              <div className={styles.section}>
                <span className={styles.label}>
                  Time
                </span>

                <div className={styles.choiceGrid}>
                  {DURATIONS.map((value) => (
                    <button
                      key={value}
                      className={`${styles.choice} ${
                        duration === value
                          ? styles.choiceActive
                          : ""
                      }`}
                      onClick={() => setDuration(value)}
                      type="button"
                    >
                      ⏱️ {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <span className={styles.label}>
                  Vibe
                </span>

                <div className={styles.choiceGrid}>
                  {VIBES.map((value) => (
                    <button
                      key={value.label}
                      className={`${styles.choice} ${
                        vibe === value.label
                          ? styles.choiceActive
                          : ""
                      }`}
                      onClick={() =>
                        setVibe(value.label)
                      }
                      type="button"
                    >
                      {value.icon} {value.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <span className={styles.label}>
                  Who is coming?
                </span>

                <div className={styles.choiceGrid}>
                  {COMPANIONS.map((value) => (
                    <button
                      key={value.label}
                      className={`${styles.choice} ${
                        companion === value.label
                          ? styles.choiceActive
                          : ""
                      }`}
                      onClick={() =>
                        setCompanion(value.label)
                      }
                      type="button"
                    >
                      {value.icon} {value.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className={styles.generate}
                onClick={generate}
                disabled={
                  loading || !city.trim()
                }
                type="button"
              >
                {loading
                  ? "Finding your route..."
                  : "Create my Offbeat"}
              </button>

              <p className={styles.guestNote}>
                {user
                  ? "Your preferences can be remembered for next time."
                  : "Guest mode is private and unsaved. Sign in only when you want to keep an adventure."}
              </p>

              {errorMsg && (
                <p className={styles.error}>
                  {errorMsg}
                </p>
              )}
            </section>

            {adventure && (
              <article className={styles.ticket}>
                <div className={styles.ticketTop}>
                  <div className={styles.ticketCode}>
                    BOARDING PASS · #{code}
                  </div>

                  <h2 className={styles.ticketTitle}>
                    {adventure.title}
                  </h2>

                  <p className={styles.ticketSub}>
                    {adventure.tagline}
                  </p>
                </div>

                <div className={styles.stops}>
                  {(adventure.stops || []).map(
                    (stop, index) => (
                      <div
                        className={styles.stop}
                        key={`${stop.name}-${index}`}
                      >
                        <span
                          className={styles.stopNum}
                        >
                          {index + 1}
                        </span>

                        <strong>{stop.name}</strong>

                        <div>
                          <a
                            className={styles.map}
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${stop.name}, ${city}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            📍 Open in Maps ↗
                          </a>
                        </div>

                        {stop.description && (
                          <p
                            style={{
                              margin: "8px 0 0",
                              color: "#707570",
                              fontSize: ".82rem",
                              lineHeight: 1.45,
                            }}
                          >
                            {stop.description}
                          </p>
                        )}
                      </div>
                    )
                  )}

                  {user ? (
                    <button
                      className={styles.complete}
                      onClick={markCompleted}
                      disabled={justCompleted}
                      type="button"
                    >
                      {justCompleted
                        ? "✓ Saved to Completed"
                        : "Mark adventure completed"}
                    </button>
                  ) : (
                    <div className={styles.guestSave}>
                      Want to keep this adventure? Sign
                      in with Google and generate it again
                      to save it to your profile.
                    </div>
                  )}
                </div>
              </article>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  const [user, setUser] = useState(undefined);
  const [guest, setGuest] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] =
    useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let active = true;

    setProfileLoading(true);

    apiFetch("/api/profile", user)
      .then((data) => {
        if (!active) {
          return;
        }

        const fallback = {
          name: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
        };

        setProfile({
          ...fallback,
          ...(data.profile || {}),
        });
      })
      .catch(() => {
        if (active) {
          setProfile({
            name: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
          });
        }
      })
      .finally(() => {
        if (active) {
          setProfileLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    setGuest(false);
  };

  if (user === undefined) {
    return (
      <main className={styles.authCard}>
        <div className={styles.authInner}>
          <Logo />
          <p className={styles.hello}>
            Loading Offbeat...
          </p>
        </div>
      </main>
    );
  }

  if (!user && !guest) {
    return (
      <Landing
        onGuest={() => setGuest(true)}
      />
    );
  }

  if (user && profileLoading) {
    return (
      <main className={styles.authCard}>
        <div className={styles.authInner}>
          <Logo />
          <p className={styles.hello}>
            Getting your Offbeat ready...
          </p>
        </div>
      </main>
    );
  }

  if (user && !profile?.name) {
    return (
      <AuthGate
        user={user}
        onDone={setProfile}
      />
    );
  }

  return (
    <Generator
      user={user || null}
      profile={profile}
      onLogout={logout}
    />
  );
}
