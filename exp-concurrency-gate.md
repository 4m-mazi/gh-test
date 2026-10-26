# reusable workflow の concurrency ゲート位置 実測キット

検証主張（handoff `handoff-om-reusable-concurrency-2026-10-27.md`）:

> reusable workflow を呼び出すジョブの concurrency は呼び出し側（`jobs.<job_id>.concurrency`）で指定する必要がある。呼ばれる workflow のトップレベル `concurrency` は呼び出し時にはゲートとして機能しない

ドキュメントに明記がないため、GitHub Actions の実挙動で決着をつける。ビルド・push 無し（`sleep` だけ）。

## ファイル構成

| 実験 | reusable | caller × 2 | concurrency 配置 |
|---|---|---|---|
| A（本命） | `exp-a-reusable.yml` top-level のみ `group: exp-a, queue: max` | 無し | 呼ばれる側のみ |
| B | `exp-b-reusable.yml` 無し | `jobs.call.concurrency` のみ `group: exp-b, queue: max` | 呼び出し側のみ |
| C | `exp-c-reusable.yml` top-level `group: exp-c, queue: max` | `jobs.call.concurrency` `group: exp-c, queue: max` | 両方（同一グループ） |

保持ジョブは `sleep 300`（`SLEEP_SECONDS` env で変更可、`timeout-minutes: 15`）。C は実験 A の結果が「呼ばれる側 top-level も効く」だったときだけ実行する（同一グループ二重ゲートのデッドロック確認）。実験間は待機 run が残っていないか確認してから次を実行する。

## 前提

- これらのファイルを `reusable-test` ブランチにコミットして push 済みであること（作業ツリーに置くだけだと GitHub 側で参照できない）。**dispatch は常に `-r reusable-test` 付き**（デフォルトブランチ main にはファイルが無いので失敗する）。
- 既存の `debug.yml` も同じ push で走るが実験には無関係（無視してよい）。
- `queue: max` は pending 最大 100・FIFO、`cancel-in-progress: true` と併用不可（公式 changelog / docs で確定済み）。FIFO は「グループで待ち始めた時刻順」で dispatch 順ではない。
- 同一リポジトリ参照は `$/.github/workflows/{filename}`（2026-10 時点の docs 推奨、GHES 不可、`@{ref}` 不可）と `./` が併存し、docs 上は同じ「呼び出し元と同一コミットから解決」表記。実験は om 実構成に合わせて `./` を使用。`$/` の実解測が必要なら exp-a-caller-2.yml の `./` を `$/` に差し替えて再実行するのが最小（主実験では変数を増やさない）。

## 実験 A — 呼ばれる側 top-level concurrency は呼び出し時に効くか

発火（2 つを素早く連続実行。間隔が短いほど開始順仮定に近い）:

```pwsh
gh workflow run exp-a-caller-1.yml -r reusable-test
gh workflow run exp-a-caller-2.yml -r reusable-test
```

観測（直後と 1〜2 分後に、呼び出しジョブ `call` の status を見る）:

```pwsh
gh run list --workflow exp-a-caller-1.yml --json databaseId,status,createdAt,runStartedAt
gh run list --workflow exp-a-caller-2.yml --json databaseId,status,createdAt,runStartedAt
gh api repos/4m-mazi/gh-test/actions/runs/<run_id>/jobs --jq '.jobs[] | {name, status, started_at}'
```

判定:

- 片方の `call` ジョブ（あるいは run 自体）が `queued`/`waiting` になり、もう片方の完了後に起動して直列化 → **呼ばれる側 top-level がゲートとして効く。主張は偽**
- 両 run の `call` ジョブが同時に `in_progress`（並走）→ **主張は真**

Waiting が run レベルとジョブレベルのどちらで出るかも記録する（副次計測）。あわせて run 一覧・API で「reusable 呼び出しは別 run を作らず呼び出し側 run にネストされる」こと、`ctx` ステップログの `workflow=` に呼び出し側ワークフロー名が出る（呼ばれる側は `github.workflow` に caller 名を使う）ことを確認する。

### A 対照（direct 実行で queue 自体の挙動確認）

```pwsh
git push origin HEAD:refs/heads/exp/direct          # ブランチ作成を兼ねて 1 本目
git commit --allow-empty -m "exp direct 2"
git push origin HEAD:refs/heads/exp/direct          # 2 本目（同一 HEAD だと push イベントにならない）
```

`exp-A reusable` の direct run が 2 本出ている間、2 本目が `Waiting` → FIFO 直列化されれば `queue: max` の挙動自体は妥当。これが効かなければ設定を見直して実験をやり直す。

## 実験 B — 呼び出し側 `jobs.<id>.concurrency` が実際にゲートするか

```pwsh
gh workflow run exp-b-caller-1.yml -r reusable-test
gh workflow run exp-b-caller-2.yml -r reusable-test
```

2 本目の `call` ジョブが `Waiting` → 1 本目完了後に起動（FIFO 直列化）なら、docs の supported keyword と実挙動が一致。この reusable には top-level concurrency が無いので、待機が出る要因は呼び出し側ジョブの concurrency のみ。

## 実験 C — 同一グループ二重取得でデッドロックしないか（A が「効く」の場合のみ）

```pwsh
gh workflow run exp-c-caller-1.yml -r reusable-test
gh workflow run exp-c-caller-2.yml -r reusable-test
```

- 1 本目が完走し（自分の reusable ジョブが自分のゲートで待たされない）、2 本目がその後に走る → 二重ゲート構成は安全
- 永遠に `Waiting` が続く → デッドロック。om の修正構成（呼ばれる側 top-level + 呼び出し側 job の同一グループ）は見直し

sleep 5 分 × 2 本ぶん、最低 10 分間は起動の有無を観察する。

## 副次計測（できれば）

- キュー参入時刻のセマンティクス: run の `created_at` / `run_started_at`、ジョブの `started_at` を比べ、ワークフローレベルは「run 作成時」、ジョブレベルは「ジョブが起動可能になった時」に pending になるかの整理どおりか確認
- 待機中の UI 表示文言（`waiting — exp-a` 等）

## 後片付け

実験 run が残っていないか確認（待機中のものは `gh run cancel <id>`）してから、このファイルと `.github/workflows/exp-*.yml` を削除。`exp/direct` ブランチを作った場合は `git push origin --delete exp/direct`。
