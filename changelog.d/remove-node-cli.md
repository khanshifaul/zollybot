### Removed

- Remove the Node `zollybot-cli` script from the app bundle and its E2E job. `zollybot-cli` is now
  only the Rust terminal front end in `crates/zollybot-cli`. The Local scripts API still serves the
  same routes over HTTP.
