pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('samuelv-dockerhub-credentials')
        IMAGE_NAME = 'samvrgl/cicd-tasklist-frontend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Typecheck') {
            steps {
                sh 'npx tsc -b --noEmit'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'npm run test:coverage'
            }
            post {
                always {
                    junit 'reports/junit.xml'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube-server-1') {
                    sh 'npx sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Trivy Scan') {
            steps {
                sh "trivy image --exit-code 0 --severity HIGH,CRITICAL --format table ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('SBOM Generation') {
            steps {
                sh "trivy image --format spdx-json --output sbom-spdx.json ${IMAGE_NAME}:${IMAGE_TAG}"
            }
            post {
                always {
                    archiveArtifacts artifacts: 'sbom-spdx.json', fingerprint: true
                }
            }
        }

        stage('Docker Push') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${IMAGE_NAME}:latest"
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}
