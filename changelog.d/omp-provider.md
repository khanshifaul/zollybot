### Added

- Add Oh My Pi (`omp`) as an agent provider. It runs `omp acp`, finds the user's own `omp` on
  `PATH`, and reads its model list from the ACP session's model config option. The provider is
  local-only, like the other ACP providers.
