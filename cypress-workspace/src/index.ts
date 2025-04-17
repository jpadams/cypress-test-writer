/**
 * A workspace for Cypress tests
 */
import { dag, Container, Directory, Service, object, func } from "@dagger.io/dagger";

@object()
export class CypressWorkspace {
  @func()
  container: Container; // The workspace container
  
  app: Service; // The app service

  constructor(
    // The git project under test
    project: string,
    // The base branch
    base: string,
    // The feature branch
    feature: string,
    // The container image to use
    image = "cypress/included:14.0.3",
  ) {
    this.app = dag
      .container()
      .from("node:latest")  
      .withEnvVariable("CI", "true")
      .withDirectory("/app", dag.git(project).branch(feature).tree())
      .withWorkdir("/app")
      .withMountedCache("/root/.npm", dag.cacheVolume("npm-cache"))
      .withExec(["npm", "ci"])
      .withExposedPort(5173)
      .asService({args: ["npm", "run", "dev"]});

    this.container = dag
      .container()
      .from(image)
      .withDirectory("/app", dag.git(project).branch(feature).tree())
      .withWorkdir("/app")
      .withExec(["git", "fetch"])
      .withExec(["git", "checkout", base]) // ensure base works      
      .withExec(["git", "checkout", feature]) // go back to feature     
      .withMountedCache("/root/.npm", dag.cacheVolume("npm-cache"))
      .withExec(["npm", "ci"])
      .withServiceBinding("app", this.app);
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
  write(path: string, content: string): CypressWorkspace {
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
  async test(): Promise<string> {
    let command: string[] = ["npm", "run", "test:e2e"];
    return this.container.withExec(command).stdout();
  }
}
