package patches.buildTypes

import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.dockerSupport
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.script
import jetbrains.buildServer.configs.kotlin.v2019_2.ui.*

/*
This patch script was generated by TeamCity on settings change in UI.
To apply the patch, create a buildType with id = 'BuildBaseImages'
in the root project, and delete the patch script.
*/
create(DslContext.projectId, BuildType({
    id("BuildBaseImages")
    name = "Build base images"
    description = "Build base docker images"

    buildNumberPattern = "%build.prefix%.%build.counter%"

    params {
        param("build.prefix", "1.0")
    }

    vcs {
        root(DslContext.settingsRoot)

        cleanCheckout = true
        branchFilter = """
            +:*
            +:wip/docker-for-ci
        """.trimIndent()
        excludeDefaultBranchChanges = true
    }

    steps {
        script {
            name = "Build docker images"
            scriptContent = "bash ./bin/build-docker.sh %build.number%"
            dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
            dockerRunParameters = "-u %env.UID%"
        }
    }

    features {
        perfmon {
        }
        dockerSupport {
            loginToRegistry = on {
                dockerRegistryId = "PROJECT_EXT_6"
            }
        }
    }
}))

