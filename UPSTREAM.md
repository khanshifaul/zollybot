# Upstream

- Source: https://github.com/nightly-labs/openbot
- Version: 0.62.0
- Commit: 9539f15d1c0924b9922060b6f4090e00a950b5bb (2026-11-06)
- Imported: 2026-11-06, working tree only (no OpenBot history in this repo).

To compare against a later release, clone upstream and diff the working tree:

```sh
git clone --depth 1 https://github.com/nightly-labs/openbot /tmp/openbot
diff -rq --exclude=.git /tmp/openbot ~/Projects/zollybot | grep -v node_modules
```

The imported tree keeps OpenBot's `LICENSE` and `NOTICE`. zollybot adds its own
work on top; the licensing strategy for that combination is the owner's call.
