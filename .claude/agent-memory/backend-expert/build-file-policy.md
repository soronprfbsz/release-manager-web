---
name: 빌드 파일 정책
description: 빌드 ZIP 업로드는 ReleaseFile 인덱스를 등록하지 않음 — 빌드 자산은 디스크 직접 접근 필요
type: project
---

BuildFileService.uploadBuildZip 는 의도적으로 ReleaseFile row를 저장하지 않는다.
"빌드 디렉토리가 진실의 원천" 정책.

**결과**: 빌드의 공유 자산(nc_conf.conf 등)은 ReleaseFileRepository 조회로는 접근 불가.
`ReleaseVersionFileSystemService.resolveBuildBasePath(buildVersionEntity)` 로 경로를 계산한 뒤 직접 walk 해야 한다.

**Why:** 빌드 ZIP에는 engine 바이너리 + 공유 자산이 혼재하는데, 공유 자산까지 DB에 등록하면 스키마 복잡도가 높아진다는 팀 결정.

**How to apply:** 빌드 버전에서 파일을 읽어야 할 때 ReleaseFile 조회 대신 `fileSystemService.resolveBuildBasePath` 사용.
`EngineNameClassifier.isEngineFile(name)` 로 엔진/공유자산 구분.
