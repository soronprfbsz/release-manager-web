---
name: WSL2 Java 환경
description: 이 개발 환경에는 Java 21만 설치되어 있음 — build.gradle toolchain은 21로 설정
type: project
---

WSL2 환경에 Java 17이 없고 Java 21 (openjdk-21-openjdk-amd64) 만 설치되어 있다.
build.gradle의 `java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }` 로 운영.

**Why:** Spring Boot 3.5.6 는 Java 17+ 지원이므로 21로 올려도 호환 문제 없음.
프로젝트 원래 설정은 17이었으나 WSL2 머신에 17이 없어 21로 조정.

**How to apply:** 빌드/테스트 실행 시 `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew ...` 또는 PATH에 java21이 있으면 그냥 실행.
