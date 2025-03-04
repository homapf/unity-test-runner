import * as core from '@actions/core';
import { Action, Docker, ImageTag, Input, Output, ResultsCheck } from './model';
import MacBuilder from './model/mac-builder';

export async function run() {
  try {
    Action.checkCompatibility();

    const { workspace, actionFolder } = Action;
    const {
      editorVersion,
      customImage,
      projectPath,
      customParameters,
      testMode,
      coverageOptions,
      artifactsPath,
      useHostNetwork,
      sshAgent,
      gitPrivateToken,
      githubToken,
      checkName,
      chownFilesTo,
      unityLicensingServer,
    } = Input.getFromUser();
    const baseImage = new ImageTag({ editorVersion, customImage });
    const runnerContext = Action.runnerContext();

    try {
      if (process.platform === 'darwin') {
        MacBuilder.run(actionFolder);
      }
      else {
        await Docker.run(baseImage, {
          actionFolder,
          editorVersion,
          workspace,
          projectPath,
          customParameters,
          testMode,
          coverageOptions,
          artifactsPath,
          useHostNetwork,
          sshAgent,
          gitPrivateToken,
          githubToken,
          chownFilesTo,
          unityLicensingServer,
          ...runnerContext,
        });
      }
    } finally {
      await Output.setArtifactsPath(artifactsPath);
      await Output.setCoveragePath('CodeCoverage');
    }

    if (githubToken) {
      const failedTestCount = await ResultsCheck.createCheck(artifactsPath, githubToken, checkName);
      if (failedTestCount >= 1) {
        core.setFailed(`Test(s) Failed! Check '${checkName}' for details.`);
      }
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}
