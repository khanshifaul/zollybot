import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/harness";

export const messages = {
  "error.harness.mcpConfig":
    "ZollyBot は Codex の設定に MCP サーバーを登録できませんでした。Codex の config.toml が有効で書き込み可能であることを確認してから、ZollyBot を再起動してください。",
  "error.harness.computerUseConfig":
    "ZollyBot は Codex の設定に Computer Use を登録できませんでした。Codex の config.toml が有効で書き込み可能であることを確認してから、ZollyBot を再起動してください。Computer Use なしで続行するには、エージェントの設定で Computer Use をオフにできます。",
  "error.harness.codexUnresponsive": "Codex が応答しなくなったため、ZollyBot がそのプロセスを終了しました。",
  "error.harness.acpUnresponsive": "{harness} が時間内に応答しなかったため、ZollyBot がそのプロセスを終了しました。",
  "error.harness.acpSignInLost":
    "{harness} のサインインが失われたため、ZollyBot がそのプロセスを終了しました。メッセージをもう一度送信してください。",
  "error.harness.acpMcpNotLoaded":
    "{harness} が ZollyBot のツールを読み込まなかったため、このエージェントはツールを使えず、チームメイトにも連絡できません。{harness} のチームポリシーがローカル MCP サーバーをブロックしている可能性があります。チーム管理者に許可を依頼してから、もう一度お試しください。",
  "error.harness.endpointsReadOnly":
    "保存されたエンドポイントは新しいバージョンの ZollyBot で書き込まれたか、ファイルを読み取れません。変更するには ZollyBot を更新してください。",
  "error.harness.endpointNoSecureStorage":
    "このコンピューターには安全なストレージがないため、API キーやヘッダーを保存できません。それらを削除するか、認証情報が不要なエンドポイントを使用してください。",
  "error.harness.endpointDuplicate":
    "このプロバイダー ID のエンドポイントはすでに保存されています。先に削除するか、別の ID を使用してください。",
  "error.harness.endpointNotSaved": "このエンドポイントは保存されていません。一覧を更新して、もう一度お試しください。",
  "error.harness.endpointKeyForNewAddress":
    "アドレスのホストまたはポートが変わりました。保存済みの API キーとヘッダーが新しいアドレスに送られないように、もう一度入力してください。",
  "error.harness.endpointSecretUnreadable":
    "このコンピューターは保存済みの API キーとヘッダーを読み取れません。失われないように、API キーとヘッダーをもう一度入力してください。",
  "error.harness.discoveryTimeout": "{host} から時間内に応答がありませんでした。",
  "error.harness.discoveryUnreachable": "ZollyBot は {host} に接続できませんでした。",
  "error.harness.discoveryRedirect":
    "{host} がリダイレクトを返しました。サーバーの最終的なアドレスを入力してください。",
  "error.harness.discoveryRefused": "{host} がリクエストを拒否しました。API キーとヘッダーを確認してください。",
  "error.harness.discoveryHttp": "{host} が HTTP {status} で応答しました。",
  "error.harness.discoveryTooLarge": "{host} のモデル一覧が大きすぎます。",
  "error.harness.discoveryInvalid": "{host} は OpenAI 互換のモデル一覧を返しませんでした。",
  "error.harness.detectionSettingsReadOnly":
    "検出の設定は新しいバージョンの ZollyBot で書き込まれたか、ファイルを読み取れません。変更するには ZollyBot を更新してください。",
  "error.harness.detectionEntryInvalid":
    "アドレスはパスワードを含まない http:// または https:// の URL に、フォルダーは絶対パスにしてください。",
  "error.harness.detectionEntriesTooMany": "アドレスまたはフォルダーが多すぎます。",
  "error.harness.credentialFileUnreadable": "プロバイダーの認証情報ファイルを読み取れません。",
  "error.harness.credentialFileTooLarge": "プロバイダーの認証情報ファイルが大きすぎます。",
  "error.harness.archiveSpecialFile": "ランタイムのアーカイブにリンクまたは特殊ファイルが含まれています。",
  "error.harness.archiveUnsafePath": "ランタイムのアーカイブに安全でないパスが含まれています。",
  "error.harness.runtimeSpecialFile": "ランタイムにリンクまたは特殊ファイルが含まれています。",
  "error.harness.codexArchivePath": "Codex のアーカイブに予期しないパスがあります。",
  "error.harness.codexVersionUnexpected": "Codex ランタイムのバージョンが予期しないものです。",
  "error.harness.claudeArchivePath": "Claude のアーカイブに予期しないパスがあります。",
  "error.harness.claudePackageMismatch": "Claude パッケージがランタイムカタログと一致しません。",
  "error.harness.claudeChecksum": "Claude ランタイムのチェックサムが一致しません。",
  "error.harness.claudeLicenseChecksum": "Claude ライセンスのチェックサムが一致しません。",
  "error.harness.opencodeArchivePath": "OpenCode のアーカイブに予期しないパスがあります。",
  "error.harness.opencodePackageMismatch": "OpenCode パッケージがランタイムカタログと一致しません。",
  "error.harness.opencodeChecksum": "OpenCode ランタイムのチェックサムが一致しません。",
  "error.harness.opencodeLicenseChecksum": "OpenCode ライセンスのチェックサムが一致しません。",
  "error.harness.grokChecksum": "Grok ランタイムのチェックサムが一致しません。",
  "error.harness.grokLicenseChecksum": "Grok ライセンスのチェックサムが一致しません。",
  "error.harness.grokNoticesChecksum": "Grok 通知ファイルのチェックサムが一致しません。",
  "error.harness.bunArchivePath": "Bun のアーカイブに予期しないパスがあります。",
  "error.harness.bunPackageMismatch": "Bun パッケージがランタイムカタログと一致しません。",
  "error.harness.bunChecksum": "Bun ランタイムのチェックサムが一致しません。",
  "error.harness.bunLicenseChecksum": "Bun ライセンスのチェックサムが一致しません。",
  "error.harness.bunxDamaged": "Bun パッケージマネージャーの実行ツールが見つからないか、破損しています。",
  "error.harness.releaseSourcesUnreachable":
    "ZollyBot はプロバイダーのリリース元に接続できませんでした。接続を確認して、もう一度お試しください。",
  "error.harness.runtimesUnsupported": "このプラットフォームではプロバイダーのランタイムを使用できません。",
  "error.harness.closing": "ZollyBot を終了しています。",
  "error.harness.removeWhileOn": "ダウンロードを削除する前に、プロバイダーをオフにしてください。",
  "error.harness.removeWhileDownloading": "ダウンロードが終わってから削除してください。",
  "error.harness.removeIncomplete":
    "この CLI のファイルを別のプログラムが使用しています。閉じてから、もう一度お試しください。",
  "error.harness.removeDownloadsFailed": "{harnesses} の CLI のダウンロードを削除できませんでした。",
  "error.harness.cliOverride": "ZollyBot で更新する前に、明示的な CLI パスの指定を削除してください。",
  "error.harness.runtimeUpdateIncomplete": "ランタイムの更新が完了しませんでした。",
  "error.harness.downloadHttp": "ランタイムのダウンロードが HTTP {status} で失敗しました。",
  "error.harness.downloadNoData": "ランタイムのダウンロードでデータが返されませんでした。",
  "error.harness.downloadSize": "ランタイムのダウンロードのサイズが予期しないものです。",
  "error.harness.downloadIntegrity": "ランタイムのダウンロードが整合性チェックに失敗しました。",
  "error.harness.runtimeReplacing": "別のインスタンスがランタイムを置き換えているため、インストールできませんでした。",
  "error.harness.runtimeFilesInUse":
    "別のプログラムがランタイムのファイルを開いているため、インストールできませんでした。そのプログラムを閉じてから、もう一度お試しください。",
  "error.harness.metadataHttp": "ランタイムのメタデータのダウンロードが HTTP {status} で失敗しました。",
  "error.harness.metadataIntegrity": "ランタイムのメタデータが整合性チェックに失敗しました。",
  "error.harness.diskSpace": "このプロバイダーに必要な空きディスク容量が足りません。",
  "error.harness.unexpectedVersion": "プロバイダーのランタイムが予期しないバージョンを返しました。",
  "error.harness.metadataNoData": "ランタイムのメタデータのダウンロードでデータが返されませんでした。",
  "error.harness.metadataTooLarge": "ランタイムのメタデータが大きすぎます。",
  "error.harness.requestFailed": "ZollyBot は {url} をダウンロードできませんでした。{reason}",
  "error.harness.installRecordMismatch": "ランタイムのインストール記録が一致しません。",
  "error.harness.runtimeChecksum": "プロバイダーのランタイムのチェックサムが一致しません。",
  "error.harness.codexReleaseShape": "Codex のリリース情報の形式が予期しないものです。",
  "error.harness.codexReleaseNoDownload":
    "Codex のリリースには、このコンピューター向けの検証可能なダウンロードがありません。",
  "error.harness.claudeReleaseShape": "Claude のリリース情報の形式が予期しないものです。",
  "error.harness.grokReleaseVersion": "Grok のリリースのバージョンが予期しないものです。",
  "error.harness.blockedListShape": "ブロックされたバージョンのリストの形式が予期しないものです。",
  "error.harness.releaseNoDownload": "{name} のリリースには検証可能なダウンロードがありません。",
  "error.harness.releaseSizeUnknown": "リリースのダウンロードのサイズが不明です。",
  "error.harness.releaseMetadataNotObject": "リリースのメタデータが JSON オブジェクトではありません。",
  "error.harness.releaseCheckHttp": "リリースの確認が HTTP {status} で失敗しました。",
  "error.harness.releaseMetadataTooLarge": "リリースのメタデータが大きすぎます。",
  "error.harness.idInvalid": "プロバイダー ID には英小文字、数字、`-`、`_` のみを使用してください。",
  "error.harness.baseUrlInvalid": "ベース URL が URL ではありません。",
  "error.harness.baseUrlProtocol": "ベース URL は http:// または https:// で始める必要があります。",
  "error.harness.baseUrlCredentials":
    "ベース URL にユーザー名やパスワードを含めないでください。認証情報はヘッダーに入れてください。",
  "error.harness.modelsRequired": "モデルが 1 つ以上必要です。",
  "error.harness.modelsTooMany": "モデルが多すぎます。",
  "error.harness.modelIdCharacter": "モデル ID に使用できない文字が含まれています。",
  "error.harness.modelIdDuplicate": "2 つのモデルの ID が同じです。",
  "error.harness.contextWindowInvalid":
    "モデルのコンテキストウィンドウは {min} から {max} までの整数のトークン数にしてください。",
  "error.harness.maxOutputInvalid": "モデルの最大出力は {min} から {max} までの整数のトークン数にしてください。",
  "error.harness.reasoningEffortsInvalid": "モデルの推論の強さが無効です。",
  "error.harness.headersTooMany": "ヘッダーが多すぎます。",
  "error.harness.headerNameCharacter": "ヘッダー名に HTTP で使用できない文字が含まれています。",
  "error.harness.headerNameTooLong": "ヘッダー名が長すぎます。",
  "error.harness.headerNameDuplicate": "2 つのヘッダーの名前が同じです。",
  "error.harness.headerValueInvalid": "ヘッダーの値がないか、長すぎます。",
  "error.harness.headerValueMissing": "ヘッダー {name} の値を入力してください。",
  "error.harness.apiKeyTooLong": "API キーが長すぎます。",
  "error.harness.localOnly": "プロバイダーは、エージェントを実行しているコンピューターでのみ変更できます。",
  "error.harness.keyRequired": "プロバイダーキーが必要です。",
  "error.harness.keyTooLong": "プロバイダーキーが長すぎます。",
  "error.harness.keyInvalidCharacters": "プロバイダーキーに、キーに使えない空白または文字が含まれています。",
  "error.harness.noModel": "選択したプロバイダーに使用できるモデルがありません。",
  "error.harness.noModelNamed": "{harness} に使用できるモデルがありません。",
  "error.harness.acpNoModels": "ACP CLI が ACP モデルを通知しませんでした。ZollyBot は代替モデルを推測しません。",
  "error.harness.endpointRemoveBusy":
    "このエンドポイントを削除する前に、実行中のターンとキューが終わるまでお待ちください。",
  "error.harness.codexOutdated": "Codex CLI {version} は古すぎます。ZollyBot には 0.156.0 以降が必要です。",
  "error.harness.codexNotStarted": "Codex CLI は見つかりましたが、起動できませんでした。",
  "error.harness.codexNotStartedHint":
    "Codex CLI は見つかりましたが、起動できませんでした。新しいターミナルで `codex --version` を実行してください。",
  "error.harness.codexManagedNotStarted":
    "ChatGPT はダウンロード済みですが、起動できませんでした。ZollyBot でもう一度ダウンロードしてください。",
  "error.harness.codexMissing":
    "ChatGPT はダウンロードされていません。続けるには ZollyBot でダウンロードしてください。",
  "error.harness.claudeOutdated": "Claude Code {version} は古すぎます。ZollyBot には 2.1.232 以降が必要です。",
  "error.harness.claudeNotStarted": "Claude CLI は見つかりましたが、起動できませんでした。",
  "error.harness.claudeNotStartedHint":
    "Claude CLI は見つかりましたが、起動できませんでした。新しいターミナルで `claude --version` を実行してください。",
  "error.harness.claudeManagedNotStarted":
    "Claude はダウンロード済みですが、起動できませんでした。ZollyBot でもう一度ダウンロードしてください。",
  "error.harness.claudeMissing":
    "Claude はダウンロードされていません。続けるには ZollyBot でダウンロードしてください。",
  "error.harness.grokOutdated": "Grok CLI {version} は古すぎます。ZollyBot には 1.0.5 以降が必要です。",
  "error.harness.grokNotStarted": "Grok CLI は見つかりましたが、起動できませんでした。",
  "error.harness.grokNotStartedHint":
    "Grok CLI は見つかりましたが、起動できませんでした。新しいターミナルで `grok --version` を実行してください。",
  "error.harness.grokMissing": "Grok はダウンロードされていません。続けるには ZollyBot でダウンロードしてください。",
  "error.harness.opencodeNotStarted":
    "OpenCode を起動できませんでした。ターミナルで `opencode --version` を実行してください。",
  "error.harness.opencodeMissing":
    "OpenCode はダウンロードされていません。続けるには ZollyBot でダウンロードしてください。",
  "error.harness.codexVersionUnreadable": "Codex CLI のバージョンを読み取れません。",
  "error.harness.claudeVersionUnreadable": "Claude CLI のバージョンを読み取れません。",
  "error.harness.grokVersionUnreadable": "Grok CLI のバージョンを読み取れません。",
  "error.harness.opencodeVersionUnreadable": "OpenCode CLI のバージョンを読み取れません。",
  "error.harness.bunVersionUnreadable": "Bun ランタイムのバージョンを読み取れません。",
  "error.harness.connectBeforeProfile": "プロフィールを生成する前に、選択したプロバイダーに接続してください。",
  "error.harness.cliNotReady": "{harness} CLI の準備ができていないか、サインインしていません。",
  "error.harness.cliTimedOut":
    "{harness} が時間内に応答しませんでした。コンピューターの負荷が高い可能性があります。ZollyBot が再試行します。",
  "error.harness.cliTimedOutRefresh":
    "{harness} が時間内に応答しませんでした。コンピューターの負荷が高い可能性があります。プロバイダーを更新して再試行してください。",
  "error.harness.acpStartTimedOut":
    "{harness} の起動が {seconds} 秒以内に完了しませんでした。コンピューターの負荷が高い可能性があります。",
  "error.harness.acpModelsTimedOut":
    "{harness} が {seconds} 秒以内にモデルを一覧表示しませんでした。コンピューターの負荷が高い可能性があります。",
  "error.harness.startStopped":
    "{harness} の起動に続けて何度も失敗したため、ZollyBot は再試行を停止しました。プロバイダーを更新して再試行してください。",
  "error.harness.tempDiskSpace":
    "{harness} の起動には 1 GB 以上の空きディスク容量が必要です。空き容量を確保してから、プロバイダーを更新してください。",
  "error.harness.noCodeSignIn": "{harness} にはコードでサインインできません。",
  "error.harness.codeLoginNoLink": "プロバイダーがサインインのリンクを表示しませんでした。もう一度お試しください。",
  "error.harness.hostSignInEnded": "{harness} のサインインが完了しませんでした。もう一度お試しください。",
  "error.harness.codeLoginNotWaiting": "コードを待っているサインインはありません。サインインをやり直してください。",
  "error.harness.codeLoginBadCode": "サインインページに表示されたコードを貼り付けてください。",
  "error.harness.codeLoginRefused": "プロバイダーがコードを受け付けませんでした。サインインをやり直してください。",
  "error.harness.codeLoginUnsupported":
    "このサーバーでは、貼り付けたコードでサインインできません。サーバーのコンピューターのブラウザーでサインインしてください。",
  "error.harness.cliBusyRetry": "{harness} CLI はターンを処理中です。終わるまで待ってから、もう一度お試しください。",
  "error.harness.cliSigningIn":
    "{harness} CLI はサインイン中です。サインインを完了するかキャンセルしてから更新してください。",
  "error.harness.cliBusyUpdate": "{harness} CLI はターンを処理中です。終わるまで待ってから更新してください。",
  "error.harness.cliSelectFailed": "ZollyBot はインストール済みの管理対象 CLI を選択できませんでした。",
  "error.harness.noAuthenticatedAccount": "{harness} は認証済みのアカウントを返しませんでした。",
  "error.harness.signInExpired":
    "{harness} のサインインの有効期限が切れました。続けるには、もう一度サインインしてください。",
  "error.harness.cliActivateFailed": "ZollyBot は管理対象 CLI を有効にできませんでした。",
  "error.harness.noMainlandChinaSignIn": "{harness} には中国本土向けのログインがありません。",
  "error.harness.cliNewVersionNotStarted": "新しいバージョンが起動しませんでした。",
  "error.harness.cliBusyReconnect": "{harness} CLI はターンを処理中です。終わるまで待ってから再接続してください。",
  "error.harness.cliBusySignOut": "{harness} CLI はターンを処理中です。終わるまで待ってから切断してください。",
  "error.harness.opencodeCredentialsRejected":
    "モデルプロバイダーが API キーを拒否しました。設定で OpenCode のキーを修正するか、`opencode auth login` でプロバイダーのキーを修正してください。その後、もう一度お試しいただくか、別のモデルを選択してください。\n{detail}",
  "error.harness.opencodeAuthRequired":
    "OpenCode はモデルプロバイダー「{harness}」にサインインしていません。「無料」ラベルのモデルを選択するか、プロバイダーを接続してください。OpenCode の設定に OpenCode Go のキーを貼り付けるか、ターミナルで `opencode auth login` を実行します。その後、もう一度お試しください。",
  "error.harness.opencodeAuthRequiredUnknown":
    "OpenCode はこのモデルのプロバイダーにサインインしていません。「無料」ラベルのモデルを選択するか、プロバイダーを接続してください。OpenCode の設定に OpenCode Go のキーを貼り付けるか、ターミナルで `opencode auth login` を実行します。その後、もう一度お試しください。",
  "error.harness.customEndpointKeyRefused":
    "エンドポイント「{harness}」が API キーまたはヘッダーを拒否しました。サーバー設定 → プロバイダーでもう一度入力してから、もう一度お試しください。",
  "error.harness.customEndpointKeyMissing":
    "エンドポイント「{harness}」には API キーが必要です。サーバー設定 → プロバイダーでキーを追加してから、もう一度お試しください。",
  "error.harness.opencodeKeyExpired":
    "OpenCode の API キーの有効期限が切れました。OpenCode Console で新しいキーを作成し、OpenCode の設定に貼り付けてから、もう一度お試しください。",
  "error.harness.opencodeServiceFailure":
    "OpenCode のローカルサービスが失敗したため、このターンを完了できませんでした。もう一度お試しください。エラーが続く場合は、設定で OpenCode を再接続してください。",
  "error.harness.opencodeRateLimited":
    "モデルプロバイダーがレート制限のためリクエストを拒否しました。数分待つか別のモデルを選んでから、もう一度お試しください。\n{detail}",
  "error.harness.opencodeBilling":
    "モデルプロバイダーがアカウントの請求の問題のためリクエストを拒否しました。待っても解決しません。プロバイダーのアカウントに支払い方法または残高を追加するか、別のモデルを選んでください。\n{detail}",
  "error.harness.opencodeInvalidUpload":
    "OpenCode のモデルプロバイダーが無効なアップロードリクエストを報告しました。別のモデルを選択して続行してください。ルーティンをもう一度作成する前に、保存済みのルーティンを確認してください。\n{detail}",
  "error.harness.opencodeUnreadableContent":
    "このモデルは、このチャット内のファイルまたは画像を読み取れません。ファイルを読み取れるモデルを選択してから、メッセージをもう一度送信してください。",
  "error.harness.opencodeFreeLimit":
    "OpenCode の無料モデルが使用量の上限に達しました。この上限はすべての無料モデルで共有されます。続けるには、OpenCode の設定に OpenCode Go のキーを貼り付けるか、別のプロバイダーのモデルを選択してください。",
  "error.harness.opencodeHarnessFailed":
    "モデルプロバイダー側で障害が発生しました。お使いの接続は原因ではありません。後でもう一度試すか、別のモデルを選んでください。\n{detail}",
  "error.harness.opencodeNetwork":
    "OpenCode がモデルプロバイダーに接続できませんでした。ZollyBot を実行しているコンピューターのネットワーク接続を確認してから、もう一度お試しください。\n{detail}",
  "error.harness.codexStateBusy":
    "ChatGPT は前回の起動後、まだローカル履歴を準備しています。数分待ってから、もう一度お試しください。",
  "error.harness.realtimeLimitZero":
    "ZollyBot のリアルタイム CPU 制限が 0 のため、Linux がプロバイダーを停止しました。この制限はシステムから来ています。rtkit をインストールして起動し (`rtkit-daemon`)、`systemctl --user restart xdg-desktop-portal` を実行してから ZollyBot を再起動してください。rtkit がない間は、xdg-desktop-portal を再起動するだけでは解決しません。",
  "error.harness.opencodeDatabaseNewer":
    "新しいバージョンの OpenCode がデータベースを変更したため、OpenCode はデータベースを開けませんでした。OpenCode をバージョン 2 以降に更新してから、もう一度お試しください。",
  "error.harness.opencodeNoAnswer":
    "OpenCode のモデルが、回答がないままターンを終了しました。もう一度お試しいただくか、別のモデルを選択してください。",
  "error.harness.opencodeReasoningWithoutAnswer":
    "OpenCode のモデルが、推論のあと回答がないままターンを終了しました。もう一度お試しいただくか、別のモデルを選択してください。",
  "error.harness.chatgptPageFailed": "ZollyBot は ChatGPT の接続ページを開けませんでした。",
  "error.harness.noneReady": "準備ができているエージェントのプロバイダーがありません。",
  "error.harness.claudeTurnActive": "コンテキストを更新する前に、実行中の Claude のターンが終わるまでお待ちください。",
  "error.harness.codexLoginRequired":
    "Codex には ChatGPT サブスクリプションでのサインインが必要です。`codex login` を実行してください。",
  "error.harness.cliUpdateFailed": "ZollyBot は {harness} CLI を更新できませんでした。{reason}",
  "error.harness.tryAgain": "もう一度お試しください。",
  "error.harness.noAgentProcess": "{harness} には、このエージェント用に実行中のプロセスがありません。",
  "error.harness.stoppedBeforeAgentProcess": "エージェントのプロセスが開始する前に {harness} が停止しました。",
  "error.harness.archiveUnreadable": "ランタイムのアーカイブを読み取れないか、対応していない形式です。",
  "error.harness.antigravityArchivePath": "Gemini のアーカイブに予期しないファイルがあります。",
  "error.harness.antigravityChecksum": "Gemini ランタイムのチェックサムが一致しません。",
  "error.harness.antigravityReleaseShape": "Gemini のリリースの形式が予期しないものです。",
  "error.harness.antigravityMissing":
    "Gemini はダウンロードされていません。続けるには ZollyBot でダウンロードしてください。",
  "error.harness.antigravityNotStarted": "Gemini サーバーは見つかりましたが、バージョンを読み取れません。",
  "error.harness.antigravityOverrideInvalid":
    "ZOLLYBOT_ANTIGRAVITY_PATH の Gemini サーバーが見つからないか、実行できません。パスを修正するか変数を削除してから、ZollyBot を再起動してください。",
  "error.harness.antigravityVersionUnreadable": "Gemini サーバーのバージョンを読み取れません。",
  "error.harness.antigravitySignIn": "Gemini を使うには Google でサインインしてください。",
  "error.harness.antigravityRateLimited":
    "レート制限またはプランの割り当てに達したため、Gemini がリクエストを拒否しました。数分待つか別のモデルを選んでから、もう一度お試しください。\n{detail}",
  "error.harness.antigravityQuotaReached":
    "Google から Gemini の使用上限に達したと通知されました。上限は 1 つのモデルだけのものである場合があるため、プランの使用状況ページにはまだ残りが表示されることがあります。別の Gemini モデルを選ぶか、リセットまでお待ちください。\n{detail}",
  "error.harness.antigravityModelUnavailable":
    "Gemini は現在このモデルを使用できません。別のモデルを選んでから、もう一度お試しください。\n{detail}",
  "error.harness.antigravityServiceFailure":
    "Google の Gemini サービスがリクエストを完了しませんでした。数分後にもう一度お試しください。\n{detail}",
  "error.harness.cursorArchivePath": "Cursor のアーカイブに予期しないファイルがあります。",
  "error.harness.cursorChecksum": "Cursor ランタイムのチェックサムが一致しません。",
  "error.harness.cursorReleaseShape": "Cursor のリリースの形式が予期しないものです。",
  "error.harness.cursorMissing":
    "Cursor はダウンロードされていません。続けるには ZollyBot でダウンロードしてください。",
  "error.harness.cursorNotStarted": "Cursor エージェントは見つかりましたが、バージョンを読み取れません。",
  "error.harness.cursorVersionUnreadable": "Cursor エージェントのバージョンを読み取れません。",
  "error.harness.cursorSignIn": "Cursor を使うには Cursor でサインインするか、CURSOR_API_KEY を設定してください。",
  "error.harness.clineArchivePath": "Cline のアーカイブに予期しないパスがあります。",
  "error.harness.clinePackageMismatch": "Cline のパッケージがランタイムカタログと一致しません。",
  "error.harness.clineChecksum": "Cline ランタイムのチェックサムが一致しません。",
  "error.harness.clineLicenseChecksum": "Cline のライセンスのチェックサムが一致しません。",
  "error.harness.clineMissing": "Cline はダウンロードされていません。続けるには ZollyBot でダウンロードしてください。",
  "error.harness.clineOutdated": "Cline CLI {version} は古すぎます。ZollyBot には 3.0.68 以降が必要です。",
  "error.harness.clineNotStarted": "Cline を起動できませんでした。ターミナルで `cline --version` を実行してください。",
  "error.harness.clineVersionUnreadable": "Cline CLI のバージョンを読み取れません。",
  "error.harness.clineSignIn": "Cline を使うには Cline でサインインするか、CLINE_API_KEY を設定してください。",
  "error.harness.kimiArchivePath": "Kimi のアーカイブに予期しないパスがあります。",
  "error.harness.kimiChecksum": "Kimi ランタイムのチェックサムが一致しません。",
  "error.harness.kimiLicenseChecksum": "Kimi のライセンスのチェックサムが一致しません。",
  "error.harness.kimiMissing": "Kimi はダウンロードされていません。続けるには ZollyBot でダウンロードしてください。",
  "error.harness.kimiOutdated": "Kimi CLI {version} は古すぎます。ZollyBot には 1.52.0 以降が必要です。",
  "error.harness.kimiNotStarted": "Kimi を起動できませんでした。ターミナルで `kimi --version` を実行してください。",
  "error.harness.kimiVersionUnreadable": "Kimi CLI のバージョンを読み取れません。",
  "error.harness.kimiSignIn": "Kimi を使うには Kimi Code でサインインしてください。",
  "error.harness.devinSignIn": "Devin を使うには Devin でサインインしてください。",
  "error.harness.copilotSignIn":
    "GitHub Copilot を使うには GitHub でサインインするか、COPILOT_GITHUB_TOKEN を設定してください。",
  "error.harness.hermesMissing":
    "Hermes Agent がインストールされていません。インストールしてから、もう一度お試しください。",
  "error.harness.hermesNotStarted":
    "Hermes Agent を起動できませんでした。ターミナルで `hermes --version` を実行してください。",
  "error.harness.hermesVersionUnreadable": "Hermes Agent のバージョンを読み取れません。",
  "error.harness.hermesSignIn":
    "Hermes を使うには、Nous Portal でサインインするか、ターミナルで `hermes setup` を実行してください。",
  "error.harness.ompMissing": "Oh My Pi がインストールされていません。インストールしてから、もう一度お試しください。",
  "error.harness.ompNotStarted": "Oh My Pi を起動できませんでした。ターミナルで `omp --version` を実行してください。",
  "error.harness.ompVersionUnreadable": "Oh My Pi のバージョンを読み取れませんでした。",
  "error.harness.ompSignIn": "ホストコンピューターで `omp` にサインインしてから、もう一度お試しください。",
  "error.harness.usageLimitReached": "アカウントが使用量の上限に達しました。",
  "error.harness.foreignReasoning":
    "別のアカウントまたは API キーが受け取ったため、{harness} はこのチャットの以前の推論を受け付けませんでした。ZollyBot はチャット履歴を引き継いだ新しい {harness} セッションを開始しました。もう一度お試しください。",
  "error.harness.opencodeSessionRejected":
    "OpenCode がリクエストを拒否しましたが、原因は示されていません。長いチャットやモデルの変更後に起こることがあります。ZollyBot はチャット履歴を引き継いだ新しい OpenCode セッションを開始しました。もう一度お試しください。エラーが続く場合は、別のモデルを選ぶか推論レベルを下げてください。",
  "error.harness.museMcpStartupFault":
    "Muse が MCP サーバーを起動できず、このセッションで MCP をブロックしました。ZollyBot はチャット履歴を引き継いだ新しい Muse セッションを開始しました。もう一度お試しください。エラーが続く場合は、このエージェントの Computer Use または失敗した MCP サーバーをオフにしてください。",
  "error.harness.claudeSessionMissing":
    "Claude Code はこのチャットの保存済みセッションを見つけられませんでした。ZollyBot はチャット履歴を引き継いだ新しい Claude Code セッションを開始しました。もう一度お試しください。",
  "error.harness.grokSignIn": "Grok を使うには `grok login` を実行するか、XAI_API_KEY を設定してください。",
  "error.harness.acpSignInTimedOut": "サインインがタイムアウトしました。",
  "error.harness.acpSignInStopped": "サインインが完了する前に停止しました。",
  "error.harness.geminiBrowserUnavailable":
    "Gemini はサインインページを開けませんでした。ブラウザーと xdg-utils をインストールしてから、このホストのデスクトップセッションで接続してください。デスクトップのないサーバーではこのサインインを完了できません。",
  "error.harness.geminiBrowserOpenFailed":
    "Gemini はブラウザーでサインインページを開けませんでした。既定のブラウザーを確認してから、もう一度接続してください。",
  "error.harness.acpSignInFailed": "サインインが完了しませんでした。",
  "error.harness.acpSignInFailedReason": "サインインが完了しませんでした: {reason}",
  "error.harness.acpSignOutFailed": "サインアウトが完了しませんでした。",
  "error.harness.acpSignOutFailedReason": "サインアウトが完了しませんでした: {reason}",
  "error.harness.acpSignInMethodMissing":
    "このプロバイダーはこのコンピューターでこのサインイン方法を提供していません。プロバイダーを更新してから、もう一度お試しください。",
  "error.harness.httpsSignInLinkOnly": "ブラウザーで開けるのは HTTPS のサインインリンクだけです。",
  "error.harness.geminiKeyRefused":
    "Gemini は保存された API キーを拒否しました。設定でキーを置き換えるか削除してから、もう一度接続してください。",
  "error.harness.keyProviderRefused":
    "{harness} は保存された API キーを拒否しました。設定でキーを置き換えるか削除してから、もう一度お試しください。",
  "error.harness.keyProviderNoBalance":
    "保存された API キーの {harness} アカウントに残高がありません。アカウントにクレジットを追加してから、もう一度お試しください。",
  "error.harness.messageTooLarge":
    "{limit} MB を超えるメッセージを送信したため、ZollyBot は {harness} を停止しました。",
  "error.harness.customAgentIdInvalid":
    "エージェント ID には英小文字、数字、`-` のみを使用してください。組み込みプロバイダーの ID は使用できません。",
  "error.harness.customAgentEnvInvalid":
    "変数名には英字、数字、`_` のみを使用し、数字で始めないでください。各名前は 1 回だけ、最大 16 個まで使用できます。",
  "error.harness.customAgentUsagePromptInvalid": "使用量コマンドは 256 文字以内の 1 行にしてください。",
  "error.harness.customAgentCommandInvalid":
    "コマンドは完全なパス、~/ で始まるパス、またはスペースを含まないコマンド名にしてください。",
  "error.harness.customAgentArgsInvalid": "引数に改行は使用できません。引数は最大 32 個までです。",
  "error.harness.customAgentWindowsScript":
    ".cmd または .bat のコマンドの引数には、英字、数字、および - _ . , : = @ + / \\ のみを使用できます。",
  "error.harness.customAgentNotFound":
    "ZollyBot は {command} を見つけられません。コマンドの完全なパスを入力してください。",
  "error.harness.customAgentCheckTimedOut": "エージェントは 20 秒以内に応答しませんでした。",
  "error.harness.customAgentCheckStopped": "エージェントは応答する前に停止しました。",
  "error.harness.customAgentProtocolVersion":
    "このエージェントは ACP バージョン {version} を使用しています。ZollyBot はバージョン 1 を使用します。",
  "error.harness.customAgentCheckFailed": "エージェントは ACP エージェントとして応答しませんでした。",
  "error.harness.customAgentRemoveBusy":
    "このカスタムエージェントを削除する前に、実行中のターンとキューが終わるまでお待ちください。",
  "error.harness.customAgentNone": "保存されたカスタムエージェントはありません。",
  "error.harness.customAgentMissing": "このカスタムエージェントは現在保存されていません。別のモデルを選んでください。",
  "error.harness.customAgentSignIn": "エージェント自身のコマンドでサインインしてから、もう一度お試しください。",
  "error.harness.customAgentsReadOnly":
    "保存されたカスタムエージェントは新しいバージョンの ZollyBot で書き込まれたか、ファイルを読み取れません。変更するには ZollyBot を更新してください。",
  "error.harness.customAgentNoSecureStorage":
    "このコンピューターには安全なストレージがないため、環境変数の値を保存できません。値を削除して、もう一度お試しください。",
  "error.harness.customAgentNotSaved":
    "このカスタムエージェントは保存されていません。一覧を更新して、もう一度お試しください。",
  "error.harness.customAgentWorkspaceOnly":
    "{reason}。「ワークスペースのみ」がこれをブロックしています。「フルアクセス」をお試しください。",
  "error.harness.customAgentTooMany": "保存できるカスタムエージェントは最大 {count} 個です。",
  "error.harness.customAgentEnvValueMissing": "{name} の値を入力してください。",
  "error.harness.off": "{harness} は ZollyBot でオフになっています。まずプロバイダーの設定でオンにしてください。",
  "error.harness.inUse":
    "エージェントが {harness} を使用しています。このプロバイダーをオフにする前に、そのエージェントのモデルを変更してください。",
  "error.harness.useBusy": "プロバイダーの確認またはサインインが終わるまで待ってから、もう一度お試しください。",
  "error.harness.useSettingsReadOnly":
    "保存されたプロバイダーの設定を読み取れません。変更する前に ZollyBot を更新してください。",
  "error.harness.useChangeFailed": "ZollyBot はプロバイダーの設定を変更できませんでした。",
  "error.harness.accountsUnsupported": "{harness} で使えるアカウントは 1 つだけです。",
  "error.harness.accountNeedsConnection": "別のアカウントを追加する前に {harness} に接続してください。",
  "error.harness.usageResetUnsupported": "{harness} は使用量の上限をリセットできません。",
  "error.harness.signOutUnsupported": "ZollyBot は {harness} のサインインを切断できません。",
  "error.harness.usageResetNotConnected":
    "使用量をリセットする前に、この {harness} アカウントにもう一度サインインしてください。",
  "error.harness.accountLimit": "{harness} で使えるアカウントは最大 {limit} 個です。",
  "error.harness.accountNotFound":
    "この {harness} アカウントはこのコンピューターにありません。更新してからもう一度お試しください。",
  "error.harness.accountAlreadyAdded": "この {harness} アカウントはすでに接続されています。",
  "error.harness.accountDefault": "最初の {harness} アカウントは削除できません。",
  "error.harness.accountUsesKey":
    "この {harness} アカウントは保存された API キーを使うため、サインインはありません。キーはサーバーの設定 → プロバイダーで変更してください。",
  "error.harness.accountInUse":
    "このアカウントを使うエージェントが作業中です。エージェントが停止してからもう一度お試しください。",
  "error.harness.accountsReadOnly":
    "保存されたプロバイダーのアカウントを読み取れません。変更する前に ZollyBot を更新してください。",
  "error.harness.accountSignedOut":
    "この {harness} アカウントはサインアウトしています。もう一度サインインしてください。",
  "error.harness.sessionSettingUnavailable": "この設定は現在のプロバイダーセッションでは利用できません。",
  "error.harness.sessionSettingInvalid": "この値はこの設定では利用できません。",
  "error.harness.sessionSettingsBusy": "セッションの設定を変更する前に、現在のターンが終わるまでお待ちください。",
  "error.harness.piOutdated":
    "Pi {version} は古すぎます。ネイティブ RPC と MCP に対応するには、Pi 1.1.0 以降をインストールしてください。",
  "error.harness.nativeMissing": "{harness} CLI がインストールされていません。設定でダウンロードしてください。",
  "error.harness.nativeNotStarted": "{harness} CLI を起動できませんでした。",
  "error.harness.nativeVersionUnreadable": "{harness} CLI のバージョンを読み取れませんでした。",
  "error.harness.piSessionBusy": "現在の Pi のターンが終わるまでお待ちください。",
  "error.harness.piStopped": "Pi が実行されていません。Pi を接続してもう一度お試しください。",
  "error.harness.piSessionMissing": "Pi のセッションファイルがこのコンピューターにありません。",
  "error.harness.piResumeCancelled": "Pi がセッションの再開をキャンセルしました。もう一度お試しください。",
  "error.harness.piSessionIdentity": "Pi が別のセッションを返しました。保存されたセッションは置き換えられていません。",
  "error.harness.piModelInvalid": "プロバイダーを含む Pi のモデルを選択してください。",
  "error.harness.piToolInvalid": "ツールが無効な結果を返しました。",
  "error.harness.piSignIn":
    "ホストコンピューターの Pi で /login を使用してください。サインインが完了したら Pi を閉じてください。",
  "error.harness.museBusy": "Muse のセッションはビジー状態です。",
  "error.harness.museStopped": "Muse クライアントが実行されていません。",
  "error.harness.museUnexpectedProvider": "Muse が予期しないモデルプロバイダーを返しました。",
  "error.harness.museNoActiveTurn": "Muse には方向を修正できる実行中のターンがありません。",
  "error.harness.museInvalidProtocol": "Muse が無効なプロトコル応答を返しました。",
  "error.harness.museNotStarted": "Muse が起動しませんでした。",
  "error.harness.museNativeWindows": "Windows では Muse にネイティブの実行ファイルが必要です。",
  "error.harness.museStartTimeout": "Muse の初期化がタイムアウトしました。",
  "error.harness.museStartStopped": "Muse が初期化中に停止しました。",
  "error.harness.museProtocolVersion": "この Muse のプロトコルバージョンには対応していません。",
  "error.harness.museHistoryRequired": "Muse はセッション履歴を保持する必要があります。",
  "error.harness.museRequestUnsupported": "この Muse サーバーのリクエストには対応していません。",
  "error.harness.museConnectionFailed":
    "Muse への接続に失敗しました。保存された履歴を復元するには、会話を再開してください。",
  "error.harness.museUnknownSession": "不明な Muse セッションです。",
  "error.harness.museInvalidToolResult": "ZollyBot ツールの結果が無効です。",
  "error.harness.museMcpRequired": "Muse はセッションの MCP サーバーに対応している必要があります。",
  "error.harness.museSessionMismatch": "Muse が別のセッションを返しました。",
  "error.harness.museCompactRejected": "Muse が圧縮を受け付けませんでした。",
  "error.harness.museTurnMismatch": "Muse が別のターンを返しました。",
  "error.harness.museHistoryMismatch": "Muse の履歴が複数のセッションにまたがっています。",
  "error.harness.museRecoveryFailed": "Muse は欠落したイベントを復元できませんでした。",
  "error.harness.museHistoryStalled": "Muse の履歴カーソルが進みませんでした。",
  "error.harness.museApprovalUnavailable": "Muse はこの承認の応答を提示していません。",
  "error.harness.museHistoryOwner": "Muse の履歴は別のセッションのものです。",
  "error.harness.museHistoryMissing": "Muse がセッション履歴を返しませんでした。",
  "error.harness.museEmptyInput": "Muse にはテキストまたは画像が必要です。",
  "error.harness.museMethodUnsupported": "Muse は {method} に対応していません。",
  "error.harness.museTurnFailed": "Muse のターンに失敗しました。",
  "error.harness.museProfileUnsupported":
    "Muse は外部ツールにアクセスできないため、プロフィールを生成できません。別のプロバイダーでプロフィールを生成してから、エージェントに Muse を選択してください。",
  "error.harness.museAuthUnverified":
    "Muse の認証が確認されていません。ホストコンピューターで接続するか、Meta API キーを設定してください。",
  "error.harness.museSignIn": "続行するには、ホストコンピューターで Muse にサインインしてください。",
  "error.harness.inceptionSignIn": "続行するには、Inception API キーを追加してください。",
  "error.harness.deepseekSignIn": "続けるには DeepSeek API キーを追加してください。",
  "error.harness.openrouterSignIn": "続けるには OpenRouter API キーを追加してください。",
  "error.harness.terminalLoginFailed":
    "サインイン用のターミナルを開けませんでした。このホストでプロバイダーの CLI を開いてサインインしてから、プロバイダーを更新してください。",
  "error.harness.nativeArchiveInvalid": "プロバイダーのダウンロードに有効なインストールが含まれていません。",
  "error.harness.nativeChecksum": "プロバイダーのインストールが整合性チェックに合格しませんでした。",
  "error.harness.registryUnavailable": "ACP レジストリを利用できません。もう一度お試しください。",
  "error.harness.registryInvalid": "ACP レジストリが無効なデータを返しました。",
  "error.harness.registryMissing": "このエージェントは ACP レジストリにありません。",
  "error.harness.registryBusy": "このエージェントのインストールはすでに進行中です。",
  "error.harness.registryCancelled": "エージェントのインストールがキャンセルされました。",
  "error.harness.registryPrerequisite":
    "このエージェントをインストールする前に、ホストに {tool} をインストールしてください。",
  "error.harness.registryBindingChanged":
    "インストール中にカスタムエージェントが変更されました。もう一度お試しください。",
  "error.harness.registryInstallFailed":
    "エージェントのインストールに失敗しました。以前のインストールは変更されていません。",
  "error.harness.hermesInstallFailed":
    "Hermes Agent をインストールできませんでした。もう一度試すか、インストールガイドを使ってください。",
  "error.harness.hermesNeedsGitCurl":
    "Hermes Agent には git と curl が必要です。インストールしてから、もう一度試してください。",
  "error.harness.registryRemoveBusy":
    "削除する前に、エージェントのインストールと実行中の ACP の作業が終わるまでお待ちください。",
} as const satisfies PartialTranslation<typeof source>;
