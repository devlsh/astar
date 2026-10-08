# Releasing

Before release or recovery work, read [release.yml](../.github/workflows/release.yml), [release.json](../release.json), and [.manifest.json](../.manifest.json). Follow [CONTRIBUTING](../CONTRIBUTING.md) for checks and pull request review.

Confirm approval for the requested release or repair operation before acting.

- **Readiness:** Verify hosted permissions, required-check behavior, npm publishing trust, and registry state within the authorized scope. Report unresolved prerequisites before dispatch.
- **Completion:** Inspect the complete run and compare the reviewed version and source commit with the GitHub release/tag and npm version/dist-tag state. Verify published tarball identity separately from registry metadata. Release labels and manifest versions alone do not prove publication.
- **Recovery:** After a partial or ambiguous failure, inspect the exact release, source commit, and published package identity before retrying. A fresh dispatch does not resume npm publication for an existing GitHub release. Get approval for the specific repair, including any unpublishing or version-tag change.

After an authorized manual import of the [ruleset files](../.github/rulesets), review the hosted settings and verify enforcement. File changes require a new import or a hosted edit to take effect.
