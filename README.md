# Demo LLM Agent Cypress Test Writer in Dagger TypeScript SDK ✍️ 🤖🧪

## Run in `dagger` shell and let the LLM use Dagger tools to write a new Cypress test!

### What is this?
This module is an example agent that compares two branches in `git` for a UI change and creates a [Cypress](https://www.cypress.io) test to cover the change. It can run anywhere with its own containerized runtime and automatic caching thanks to [Dagger](https://github.com/dagger.io). I chose to implement this in the Dagger TypeScript SDK, but you can use any of the SDKs (e.g. Python, Go, PHP, Java, Elixir, ...) and even mix and match modules built by the Community (see https://daggerverse.dev). This demo relies on an experimental pre-release of Dagger with support for plugging micro-agent implementations into LLM "brains".

https://github.com/user-attachments/assets/0432be8b-08bb-4b2f-9409-f0175cc5bbc2

### How do I try it?

#### Get a dev Dagger CLI and Engine with LLM support using:
https://docs.dagger.io/ai-agents#initial-setup

*note: use ENV_VARs or the `.env` file to store your LLM key or a [Dagger Secrets](https://docs.dagger.io/features/secrets/) reference to it. The included example points to a sample [1Password secret reference](https://developer.1password.com/docs/cli/secret-references/).*

#### $ Load the module into Dagger Shell:
```
git clone https://github.com/jpadams/cypress-test-writer
cd cypress-test-writer

dagger
```

#### ⋈ Run test update function pointing at a remote (or local) project:
```
cypress-test-update https://github.com/jpadams/hello-dagger-ts
```

*note: my example Vue app above is modeled after the [Dagger for CI Quickstart](https://docs.dagger.io/ci/quickstart/) and has `main` and `green` branches to fit the example.*

#### ⋈ Check out your newly written Cypress test in `cypress/e2e/`. The container with generated tests will come from cache and a terminal attached.
```
cypress-test-update https://github.com/jpadams/hello-dagger-ts | terminal
```

*note: Increase verbosity to 2 or 3 (`+` in TUI) and/or view in Dagger Cloud web UI (`w` in TUI) for best results*

### Fun to try:
- in `hello-dagger/` get on the `green` branch and run `git diff main`; this diff is what is used to build the new test
- check out the `prompt.txt` in `cypress-test-update/`
- Note that in  https://github.com/jpadams/hello-dagger-ts a `dagger.json` is  present. The app is Daggerized! In the directory try fun things like: `dagger shell -c 'build | up'` (Dagger implementation inside of `.dagger/src/index.ts`)

### Notes:
- note the `contest:e2e` target in the `package.json`
  - I used `concurrently` to manage running the dev server and Cypress in one command
  - I used `--success first` to ensure the test exit code propagated, not the SIGTERM shutdown of the dev server
- I am not really a TypeScript dev, so there are likely much better ways to do certain things 😁
