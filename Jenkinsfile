def appImage

pipeline {
    agent any

    environment {
        REGISTRY = 'ghcr.io'
        IMAGE_NAME = 'celements/celements-admin-frontend'
        PROFILE = 'celdev' // Build profile (.env file profile)
        VERSION = '7.1'    // Aligned version
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                script {
                    dir('celements-admin-frontend') {
                        appImage = docker.build(
                            "${REGISTRY}/${IMAGE_NAME}:${VERSION}-${PROFILE}",
                            "--build-arg PROFILE_ACTIVE=${PROFILE} --label org.opencontainers.image.source=https://github.com/celements/celements-web --label org.opencontainers.image.description=\"Celements admin frontend\" ."
                        )
                    }
                }
            }
        }

        stage('Push to GHCR') {
            steps {
                script {
                    dir('celements-admin-frontend') {
                        def gitSha = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                        docker.withRegistry("https://${REGISTRY}", 'ghcr-credentials') {
                            appImage.push()
                            appImage.push("${VERSION}-${gitSha}")
                        }
                    }
                }
            }
        }
    }
}

