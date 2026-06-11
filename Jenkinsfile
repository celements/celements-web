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
                        def gitSha = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                        sh """
                        docker build \
                          --build-arg PROFILE_ACTIVE=${PROFILE} \
                          --label org.opencontainers.image.source=https://github.com/celements/celements-web \
                          --label org.opencontainers.image.description="Celements admin frontend" \
                          -t ${REGISTRY}/${IMAGE_NAME}:${VERSION}-${PROFILE} \
                          -t ${REGISTRY}/${IMAGE_NAME}:${VERSION}-${gitSha} \
                          .
                        """
                    }
                }
            }
        }

        stage('Push to GHCR') {
            steps {
                script {
                    dir('celements-admin-frontend') {
                        def gitSha = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                        withCredentials([usernamePassword(credentialsId: 'ghcr-credentials', usernameVariable: 'GHCR_USER', passwordVariable: 'GHCR_PAT')]) {
                            sh """
                            echo "${GHCR_PAT}" | docker login ${REGISTRY} -u "${GHCR_USER}" --password-stdin
                            docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}-${PROFILE}
                            docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}-${gitSha}
                            """
                        }
                    }
                }
            }
        }
    }
}
