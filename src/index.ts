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
    project: Directory,
    base: string = "main", // the base git branch
    feature: string = "green", // the feature git branch to generate test for
): Promise<Container> {
    // Get diff of current checkout versus main branch
    let diff = await dag
      .container()
      .from("alpine/git")
      .withDirectory("/app", project)
      .withWorkdir("/app")
      .withExec(["git", "fetch"])
      .withExec(["git", "checkout", feature])
      .withExec(["git", "diff", base])
      .stdout();
    // Create a new workspace, using third-party module
    let before = dag.cypressWorkspace(project, base, feature);
    // Run the agent loop in the workspace
    let after = dag
      .llm()
      .withCypressWorkspace(before)
      .withPromptVar("diff", diff)
      .withPromptFile(dag.currentModule().source().file("prompt.txt"))
      .cypressWorkspace();
    return after.container();
  }
}
