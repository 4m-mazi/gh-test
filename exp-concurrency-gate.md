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

## 実測結果（2026-10-27 実施・結論）

環境: github.com `4m-mazi/gh-test`（実験は main ブランチ）、無料ホスト実行ランナー、実験コミット `49352aa`（llm 自動化・偽名 author/committer）。時刻は UTC。poll 生ログは手元の `exp-timeline.log`。保持 sleep 300 秒。

### A（+対照）: 呼ばれる側 top-level concurrency は呼び出し時にゲートとして**効く** → **主張は偽**

| run | 起動 → 完了 |
|---|---|
| [exp-A caller 1](https://github.com/4m-mazi/gh-test/actions/runs/40377759897) | 18:26:36 → 18:31:39 |
| [exp-A caller 2](https://github.com/4m-mazi/gh-test/actions/runs/40377768031) | 18:26:38 より pending → **18:31:41** 起動 |
| [exp-A reusable direct-1（push）](https://github.com/4m-mazi/gh-test/actions/runs/40379033693) | 18:35:11 より pending → 18:36:47 → 18:41:51 |
| [exp-A reusable direct-2（push）](https://github.com/4m-mazi/gh-test/actions/runs/40379189134) | 18:36:15 より pending → 18:41:53 → 完了 |

呼び出し側 run/workflow には concurrency が一切無く、待機产生的な要因は reusable の top-level `group: exp-a` のみ。caller 実行と direct 実行が同一キューに入り、参入時刻順に直列化（FIFO 確認）。ゲート解放→次起動の遅延は全ケース約 2 秒。

### B: 呼び出し側 `jobs.<id>.concurrency` もゲートとして効く

[B1](https://github.com/4m-mazi/gh-test/actions/runs/40379324757) 18:37:16→18:42:20、[B2](https://github.com/4m-mazi/gh-test/actions/runs/40379337931) は 18:37:19 より pending → 18:42:22 起動。docs の supported keyword と実挙動が一致。

### C: 同一グループ二重ゲートはデッドロックしないが**順序が逆転する**

[C1（先行 dispatch 18:42:30）](https://github.com/4m-mazi/gh-test/actions/runs/40380119895) が pending のまま、[C2（後発 18:42:34）](https://github.com/4m-mazi/gh-test/actions/runs/40380128620) が 18:42:37 に先着起動（18:47:40 完了）。C1 は 18:47:43 起動 → 18:52:46 完了。呼び出しジョブ + 呼ばれる側 top-level の二重取得はアトミックに確保できず、スロットが他 run に渡り得る。**順序保証を目的とする用途では二重ゲートは不適**。

### 副次確認事項

- reusable 呼び出しは別 run を作らず、呼ばれる側ジョブは呼び出し側 run 内の `call / hold` として表示される
- 呼ばれる側ジョブログの `github.workflow` は呼び出し側名（例: `workflow=exp-A caller 1`）、`github.event_name` も呼び出し側イベント。= 呼び出し時にトップレベル group 式は呼び出し側 context で評価される。om 式に `case()` で group を条件付ける構成では、呼び出し時イベント（release/dispatch 等）でも意図グループに着地するよう既定節が必要（これは未実測の設計上の注意）
- REST API では待機中ジョブの `status=pending`（UI の Waiting）。`started_at` はジョブ作成時点で入る値なので pending 区間の計測には使えず、status ポーリングが必要
- 本実測は github.com の同一リポジトリ `./` 参照のみ。クロスリポジトリ参照・GHES は未検証

### om 向けの含意

単一ゲートにすること。**docker-publish.yml のトップレベル `concurrency` のみを残し、release.yml の `jobs.docker-publish` の `concurrency` は削除**が正。direct 実行と呼び出し実行が 1 つのキューで FIFO 直列化され、C の順序逆転も発生しない。

## 後片付け

実験 run が残っていないか確認（待機中のものは `gh run cancel <id>`）してから、このファイルと `.github/workflows/exp-*.yml` を削除。`exp/direct` ブランチを作った場合は `git push origin --delete exp/direct`。
