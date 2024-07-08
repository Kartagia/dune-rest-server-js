pipeline {
    agent any
    options {
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '5', daysToKeepStr: '', numToKeepStr: '5')
        disableConcurrentBuilds()
    }
    stages {
        stage('Hello') {
            steps {
                echo 'Hello'
                echo 'Hello again'
            }
        }
    stage("Handle fix") {
        when {
            branch 'fix-*'
        }
        steps {
            cat 'README.md'
        }
    }
    }
}