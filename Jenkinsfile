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
