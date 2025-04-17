import { dag, Container, Directory, object, func } from "@dagger.io/dagger";

@object()
export class CypressTestWriter {
  /**
   * Updates Cypress tests if needed due to code changes
   * represented by `git diff` between `base` and `feature`
   * branches. So `project` should be a full local or remote git repo.
   */
  @func()
  async CypressTestUpdate(
    project: string = "https://github.com/jpadams/hello-dagger-ts",    // The git project under test
    base: string = "main", // The base git branch
    feature: string = "green", // The feature git branch to generate test for
): Promise<Container> {
    // Get diff of current checkout versus main branch
    let diff = await dag
      .container()
      .from("alpine/git")
      .withDirectory("/app", dag.git(project).branch(base).tree())
      .withWorkdir("/app")
      .withExec(["git", "fetch"])
      .withExec(["git", "checkout", feature])
      .withExec(["git", "diff", base])
      .stdout();
    // Create a new workspace, using third-party module
    let cypress = dag.cypressWorkspace(project, base, feature);
		// Prepare environment for the agent
		let env = dag
			.env()
			.withCypressWorkspaceInput(
				"cypress-node-workspace",
				cypress,
				"a fully-loaded Cypress container workspace",
			)
			.withStringInput("diff", diff, "git diff output")
			.withCypressWorkspaceOutput("cypress-with-new-test", "The Cypress workspace with new test written");
		
    // Run the agent loop in the workspace
    let completed = dag
      .llm()
      .withEnv(env)
      .withPrompt(`
You are an expert at writing Cypress tests.
You are given a project in a Cypress/node workspace
and a git diff between two branches of a project.
First test the project to ensure all is working.
Then write a single new Cypress e2e test file to cover the change to the project
described by the git diff. Run tests again to ensure it is all working.
When tests are passing, return the workspace.
<diff>
${diff}
</diff>`)
    .env()
	.output("cypress-with-new-test")
	.asCypressWorkspace();
    return completed.container();
  }
}