## ==============================================================================
## Dockerfile
## - Spring Boot 애플리케이션을 멀티 스테이지 빌드로 패키징
## - builder 단계에서 JAR 생성
## - runtime 단계에서 최소 JRE 환경으로 실행
## ==============================================================================
#
#
## ==============================================================================
## 1. BUILDER STAGE
## - Gradle을 사용해 Spring Boot JAR(app.jar)을 빌드하는 단계
## - JDK가 필요하므로 JDK 이미지 사용
## ==============================================================================
#FROM eclipse-temurin:21-jdk-jammy AS builder
#
## 컨테이너 내부 작업 디렉토리 설정
#WORKDIR /app
#
## ------------------------------------------------------------------------------
## 1-1. Gradle 설정 파일 복사.d
## - 의존성 캐시를 최대한 활용하기 위함
## - build.gradle / settings.gradle이 변경되지 않으면
##   이후 의존성 다운로드 레이어는 재사용됨
## ------------------------------------------------------------------------------
#COPY gradlew .
#COPY settings.gradle .
#COPY build.gradle .
#COPY gradle gradle
#
## Gradle Wrapper 실행 권한 부여
#RUN chmod +x ./gradlew
#
## ------------------------------------------------------------------------------
## 1-2. 의존성 다운로드
## - 소스 코드 복사 전에 실행하여 Docker 캐시 최적화
## ------------------------------------------------------------------------------
#RUN ./gradlew dependencies --no-daemon
#
## ------------------------------------------------------------------------------
## 1-3. 소스 코드 복사 및 실제 빌드
## - 소스 코드는 가장 자주 변경되므로 마지막에 복사
## - bootJar 실행 시 build/libs/app.jar 생성
## ------------------------------------------------------------------------------
#COPY src ./src
#RUN ./gradlew bootJar --no-daemon
#
#
## ==============================================================================
## 2. RUNTIME STAGE
## - 빌드된 JAR 파일을 실행하는 최소 환경
## - JRE만 포함된 경량 이미지 사용
## ==============================================================================
#FROM eclipse-temurin:21-jre-jammy
#
## 컨테이너 내부 작업 디렉토리 설정
#WORKDIR /app
#
## ------------------------------------------------------------------------------
## builder 스테이지에서 생성된 app.jar를 복사
## - build.gradle에서 bootJar 파일명을 app.jar로 고정했기 때문에
##   파일명 변경 걱정 없이 안정적으로 복사
## ------------------------------------------------------------------------------
#COPY --from=builder /app/build/libs/app.jar app.jar
#
## Spring Boot 기본 포트
#EXPOSE 8080
#
## ------------------------------------------------------------------------------
## 컨테이너 시작 시 Spring Boot 애플리케이션 실행
## ------------------------------------------------------------------------------
#ENTRYPOINT ["java", "-jar", "app.jar"]


# ==============================================================================
# 1. BUILDER STAGE (JDK)
# - Alpine 버전을 사용하여 빌드 환경 자체도 가볍게 유지
# ==============================================================================
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# 캐시 효율을 위해 빌드 파일 먼저 복사
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

# 소스 복사 및 JAR 빌드
COPY src ./src
RUN ./gradlew bootJar --no-daemon

# 커스텀 JRE 생성: 필요한 모듈만 포함
RUN $JAVA_HOME/bin/jlink \
    --add-modules java.base,java.logging,java.naming,java.desktop,java.management,java.security.jgss,java.instrument,java.sql,jdk.unsupported,jdk.crypto.ec,java.compiler,java.xml,java.prefs \
    --strip-debug \
    --no-man-pages \
    --no-header-files \
    --compress=2 \
    --output /javaruntime

# ==============================================================================
# 2. RUNTIME STAGE (최소 환경)
# - JRE 전체가 아닌, builder에서 만든 커스텀 JRE만 가져옴
# ==============================================================================
FROM alpine:latest
WORKDIR /app

# Alpine에서 Java 실행을 위해 필요한 최소 라이브러리 설치
RUN apk add --no-cache gcompat

# 런타임과 JAR 복사
COPY --from=builder /javaruntime /opt/java
COPY --from=builder /app/build/libs/app.jar app.jar

# 경로 설정
ENV PATH="$PATH:/opt/java/bin"

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]