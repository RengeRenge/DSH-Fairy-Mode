# DSH-Fairy-Mode

《绝区零》Fairy 模式的 DSH 插件包：**HDD 皮肤 + `Fairy模式` 预设 + 开屏动画**，一个包、一条命令，装完和作者的界面一致。

- 皮肤：深海军蓝 HDD 界面、网格 / 扫描线 / 掠光、左上徽记与字标、侧栏常驻 Fairy 徽记（呼吸 / 光环 / 每 3.6 秒单帧撕裂）、输入框右侧电费胶囊与朗读电平条。
- 开屏：`boot.mp4` 播完换成 `boot-field.png`，徽记飞回侧栏（`boot.mp4` 随包提供）。
- 人格：`Fairy模式` 预设（称谓体系、协议标签、数字癖、问候长度规则），工具集与 `standard` 完全一致，并设为新会话默认。
- 语音：可选接本地 GPT-SoVITS v2。点朗读才加载模型、关掉即释放；未配置时自动降级为系统语音，不影响其它功能。

## 安装

**前置条件**：Windows、DSH 桌面版 44.x（先用过一次，profile 已生成）、系统里有 `git`（`git --version` 能跑）。

**第 1 步：完全退出 DSH。** 从托盘退出，只关窗口不够——安装写的是 profile 目录。

**第 2 步：执行一条命令。**

```powershell
dsh plugin --profile desktop add github:RengeRenge/DSH-Fairy-Mode
```

`dsh` 不在 PATH 里，就用安装自带的那份：

```powershell
& "$env:LOCALAPPDATA\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd" `
    plugin --profile desktop add github:RengeRenge/DSH-Fairy-Mode
```

**第 3 步：重新打开 DSH。**

也可以在对话里直接把地址丢给 Agent：

```
安装 https://github.com/RengeRenge/DSH-Fairy-Mode
```

### 装完怎么确认

| 看哪里 | 应该是 |
|---|---|
| 界面 | 深海军蓝 HDD 皮肤，左上 Fairy 徽记 + 字标 |
| 侧栏底部 | 常驻徽记：外圈光环缓慢扩散，约 3.6 秒撕裂一次 |
| 输入框右侧 | 电费胶囊（剩余 / 今日）与朗读电平条 |
| 新建会话 | 模式列表里有 **`Fairy模式`**，且是默认 |
| 首次启动 | 开屏动画播完换成背景图，徽记飞回侧栏 |

开屏只在**页面冷加载**时播一次；从托盘恢复窗口不算重新加载，详见下面的「开屏动画什么时候播」。

### 装到了哪里

| 位置 | 内容 |
|---|---|
| `profiles\desktop\node_modules\dsh-fairy-mode` | 插件本体：皮肤、`boot.mp4`、`boot-field.png`、`fairy_ref.wav`、语音部署脚本 |
| `dsh.profile.bundles` | 追加 `dsh-fairy-mode`；pnpm 装完 DSH 会自动把它加进列表并激活 |
| `cordis.patch.yml` | 不需要手改：皮肤行、`preset-fairy`、`selectedDefault: fairy` 都在插件自带的 bundle 补丁里 |

### 安装失败怎么办

| 现象 | 处理 |
|---|---|
| 卡在 `Progress: resolved 0`，或 `fatal: unable to access` | 终端到 GitHub 不通。先设代理再重试：`$env:HTTPS_PROXY = 'http://127.0.0.1:7890'`（换成你自己的代理地址） |
| 报 `pnpm was not found` | 用安装目录里的 `dsh.cmd`（见上），它自带 pnpm |
| 装完没变化 | 确认是**完全退出后重启**；再看 `profiles\desktop\package.json` 的 `dsh.profile.bundles` 有没有 `dsh-fairy-mode`，没有就补一行后重启 |
| 想重装/修复 | `dsh plugin --profile desktop install` |

## 包内包含 / 不包含

| 资源 | 大小 | 是否包含 |
|---|---|---|
| `client.js` / `index.js` | ~160 KB | ✅ |
| `boot.mp4`（开屏动画） | 70.9 MB | ✅ |
| `boot-field.png`（开屏背景） | 0.9 MB | ✅ |
| `fairy_ref.wav`（朗读参考音频） | 0.5 MB | ✅ |
| GPT-SoVITS 运行时 | ~1.5 GB | ⬇️ 由 `scripts/setup-voice.ps1` 自动部署 |
| 微调语音权重 `*.pth` / `*.ckpt` | ~240 MB | ⬇️ 从 GitHub Release `voice-v1` 下载 |

## 可选：Fairy 的声音（一条命令自动部署）

默认是**系统语音**。要换成 Fairy 的声线，装完插件后跑一次：

```powershell
& "$env:DSH_HOME\profiles\desktop\node_modules\dsh-fairy-mode\scripts\setup-voice.ps1"
```

它会自动完成：

| 步骤 | 内容 | 体积 |
|---|---|---|
| 1 | `git clone` GPT-SoVITS 并检出验证过的提交 `b4570b8` | ~200 MB |
| 2 | 建 venv、装 numpy<2 / torch cu121 / 运行时依赖，并固定 `transformers==4.51.3` | ~2.5 GB |
| 3 | 下载并**按需解压**预训练模型（hubert、roberta、fast_langdetect）、G2PW、NLTK 数据 | ~1.4 GB |
| 4 | 从 Release `voice-v1` 下载微调权重，逐个校验 SHA-256 | 240 MB |
| 5 | 生成 `voice\tts_infer_fairy.yaml` 与 `run-api.ps1`（路径按你的实际目录填） | — |
| 6 | 冒烟：`from GPT_SoVITS.TTS_infer_pack.TTS import TTS` | — |

默认装到 `%USERPROFILE%\FairyKit`，可以用 `-Home D:\FairyKit` 指定，或先设 `FAIRYKIT_HOME`。常用开关：

```powershell
-Cpu          # 不装 CUDA 版 torch（体积小一半，合成慢很多）
-SkipModels   # 只补权重与配置
-SkipWeights  # 只装运行时
-Force        # 重做某一步（默认全部「已有就跳过」）
```

下载都支持断点续传，中途失败直接重跑同一条命令即可，不会从头开始。

权重为什么放在 Release 而不是仓库里：`Fairy-e10.ckpt` 有 148 MB，超过 git 单文件 100 MB 上限；Release 附件上限是 2 GB。下载地址与 SHA-256 记在 [`voice/weights.json`](voice/weights.json)，脚本读它，不写死代码——换权重只要改这个文件，不用发版本。

装好后插件会找 `%FAIRYKIT_HOME%\run-api.ps1` 与 `%FAIRYKIT_HOME%\voice\tts_infer_fairy.yaml`：朗读开关打开时拉起，关闭时结束整棵进程树并释放显存。找不到时胶囊显示「未配置」，皮肤与人格照常工作。

语音服务默认监听 **19880**（9880 常被别的本地 TTS 占用）。要换端口就同时设置环境变量，插件与启动脚本都读它：[Environment]::SetEnvironmentVariable('FAIRY_TTS_PORT','19881','User')。

开屏那句问候也受同一个开关约束：开关关着时不合成问候、也不拉起模型，所以「一启动就吃显存」只会在你上次开着朗读时出现；开关开着时，问候会在开屏期间预合成（模型仍在加载就跳过这条问候，而不是用系统语音顶替）。

## 卸载

```powershell
dsh plugin --profile desktop remove dsh-fairy-mode
```

再完全重启。如果 `dsh.profile.bundles` 里还留着 `dsh-fairy-mode`，删掉那一行。

## 开屏动画什么时候播

只在**页面冷加载**时播一次，四个门槛按顺序判断：

1. `localStorage.hddBoot === 'off'` → 不播（主动关闭）
2. 这个页面已经播过（`__hddBootShown`）→ 不播。**从托盘恢复窗口不算重新加载**，所以「关窗口再打开」看不到开屏
3. 插件挂载时页面已加载超过 20 秒 → 不播（热更新或二次挂载）
4. 系统开启了「减少动态效果」→ 不播

想强制看一次，在开发者工具里执行 `localStorage.hddBoot = 'force'` 然后刷新；想恢复正常执行 `localStorage.removeItem('hddBoot')`。

每次判断都会往 `$DSH_HOME\hdd-boot.log` 写一行（`reason=apply` 表示页面确实重新加载过，`reason=mounted` 表示播了，其余是没播的原因）。

## 素材来源与免责声明

- 本仓库所包含的全部素材（包括但不限于界面代码、开屏动画 `boot.mp4`、参考音频 `fairy_ref.wav`、语音权重等）**均来自网络**，仅作整理与分享。
- 本项目**完全免费、不盈利**，仅供个人学习与交流使用，不用于任何商业用途。
- 本项目与米哈游（miHoYo／HoYoverse）无任何关联，亦未获得其授权。
- 使用本仓库内容所产生的一切风险与后果由使用者自行承担，作者不对任何版权纠纷或损失负责。
- 若相关权利方认为内容侵犯其权益，请联系删除，作者会及时处理。
