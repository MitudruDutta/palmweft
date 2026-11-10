# Palmweft

Point at a device in Meta Quest passthrough, ask what you want to do, and use the spatial controls an agent builds for it.

Palmweft combines a WebXR interface, a Node server, and a Chrome companion. SAM identifies objects; Muse writes, deploys, and tests connector code on the server. The wearer then uses generated controls or hand interactions. Selecting an object and approving a connection do not themselves authorize device actions.

## Run locally

Requirements: Node.js 22.12 or newer and npm. The headset experience needs a compatible Quest browser, a reachable server, and trusted HTTPS. Physical MIDI and serial devices use the Chrome companion on the computer running the server.

```sh
git clone https://github.com/MitudruDutta/palmweft.git
cd palmweft
npm ci
cp .env.example .env
npm run build
npm start
```

The repository is private; cloning requires access. Use the server's printed URL to open the companion on the computer and `/quest/` on the headset. See [Quickstart](docs/QUICKSTART.md) for pairing, certificates, model configuration, and the full workflow. Build only when an active headset session is not using the build output.

Without `MODEL_API_KEY`, the app uses visibly labelled **FIXTURE** recordings or scripted responses. These demonstrate integration, not a new live model decision. Configure the key in the private `.env` for live model calls. Keys stay on the server.

For a browser-only demonstration:

```sh
npm run demo:sim -- --fixture
```

The simulator and camera/touch pages support review without hardware. They do not establish headset hand tracking, real passthrough, physical device effects, or headset performance.

## Repository

| Path | Purpose |
| --- | --- |
| `apps/server` | Pairing, model adapters, agent execution, connector lifecycle, and device routing |
| `apps/quest` | Passthrough, hand input, generated spatial controls, and recordings |
| `apps/companion` | Desktop pairing, MIDI/serial execution, instruments, and diagnostics |
| `apps/sim` | Explicit simulated room and devices |
| `apps/iphone/Palmweft` | Optional native iPhone client |
| `apps/devterm` | Optional terminal client |
| `firmware/cardputer` | IR node firmware |
| `packages` | Shared protocol, spatial control specifications, and instrument engines |

## Checks

```sh
npm run typecheck
npm test
npm run test:quest-live
python3 -m unittest discover -s apps/devterm/tests
node scripts/bundle-third-party-notices.mjs --check
node scripts/audit-public.mjs --history
```

Browser and device checks have additional prerequisites. Follow the staging procedure in [demo acceptance](docs/DEMO-ACCEPTANCE.md); existing historical results are not verification of a new build.

## Development and submission

- [Architecture](docs/ARCHITECTURE.md)
- [Team workflow](docs/CONTRIBUTING.md)
- [Competition review and remaining work](docs/SUBMISSION.md)
- [Security boundaries](docs/SECURITY-REVIEW.md)
- [Reviewer camera and touch demo](docs/REVIEWER-DEMO.md)
- [Evidence and its limitations](docs/evidence/README.md)

Generated Node connectors run with the server user's OS permissions. Use a trusted local setup; do not expose the coding agent as a shared public service. Stop retires the active connector and its outputs. Read the security review before deployment.

The source is distributed under the [MIT license](LICENSE). Existing copyright notices and dependency licenses remain in force. Bundled dependency notices are available under each web app's `public/notices/` directory.
