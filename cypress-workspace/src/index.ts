/**
 * A workspace for Cypress tests
 */
import { dag, Container, Directory, object, func } from "@dagger.io/dagger";

@object()
export class CypressWorkspace {
  // The workspace container
  // +internal-use-only
  @func()
  container: Container;

  constructor(
    // The project under test
    project: Directory,
    // The base branch
    base: string,
    // The feature branch
    feature: string,
    // The container image to use
    image = "cypress/included:14.0.3",
  ) {
    this.container = dag
      .container()
      .from(image)
      .withMountedCache("/root/.npm", dag.cacheVolume("npm-cache"))
      .withDirectory("/app", project)
      .withWorkdir("/app")
      .withExec(["git", "fetch"])
      .withExec(["git", "checkout", base]) // ensure base works      
      .withExec(["git", "checkout", feature])      
      .withExec(["npm", "ci"])
      .withExec(["npm", "install", "-D", "concurrently"])
      .withExec(["npm", "install", "-D", "vite"]);
  }

  /**
   * Read a file
   */
  @func()
  async read(path: string): Promise<string> {
    return this.container.file(path).contents();
  }

  /**
   * Write a file
   */
  @func()
  async write(path: string, content: string): Promise<CypressWorkspace> {
    this.container = this.container.withNewFile(path, content);
    return this;
  }

  /**
   * See the files and directories/ in the cypress/ directory
   */
  @func()
  async look(): Promise<string> {
    return this.container.withExec(["find", "cypress"]).stdout();
  }

  /**
   * Run the Cypress tests in the workspace
   */
  @func()
  async test(path: string): Promise<string> {
    let command: string[] = ["npm", "run", "contest:e2e"];
    return this.container.withExec(command).stdout();
  }
}
