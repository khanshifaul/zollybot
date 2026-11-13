### Changed

- Desktop app now runs in local-only mode: no account sign-in, no Cloudflare account session, and no
  account-backed remote host, billing, license, or mobile-connect features on the desktop. The host
  keeps its own identity and teams. Web client and mobile are unaffected in this change beyond the
  shared auth state narrowing.