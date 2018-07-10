pipeline {
    options {
        buildDiscarder(logRotator(numToKeepStr: '2', artifactNumToKeepStr: '2'))
    }
    environment{
        HEROKU_API_KEY = credentials('heroku')
    }
    agent any
        stages {
            stage('Build') {
                steps {
                    echo 'No Build Step.'
                }
                post {
                    success {
                        echo 'Build succeeded.'
                    }
                    failure {
                        echo 'Build failed.'
                    }
                }
            }
            stage('Test') {
                steps {
                    sh 'make test'
                }
                post {
                    success {
                        sh 'python3 -m codecov --token f1584ece-92aa-4be7-b6ae-89c02a19af16'
                    }
                }
            }
            stage('Deploy') {
                when {
                    branch 'master'
                }
                steps {
                    sh 'heroku git:remote -a hedgeme'
                    sh 'git push heroku origin/master:master'
                }
                post {
                    success {
                        echo 'Deploy succeeded'
                    }
                    failure {
                        echo 'Deploy failed'
                    }
                }
            }
        }
    }
