# dsh-fairy-mode

《绝区零》Fairy 模式的 DSH 插件包：**HDD 皮肤 + `Fairy模式` 预设**，一个包、一条命令。

- 皮肤：深海军蓝 HDD 界面、网格底纹、左上徽记与字标、侧栏常驻 Fairy 徽记（呼吸 / 光环 / 每 3.6 秒撕裂）、输入框右侧电费胶囊与朗读电平条、开屏动画 + 背景图 + 飞回侧栏。
- 人格：`Fairy模式` 预设（Fairy 口吻、称谓体系、协议标签、数字癖），工具集与 `standard` 完全一致，并设为新会话默认。
- 语音（可选）：接本地 GPT-SoVITS v2，点朗读才加载模型、关掉即释放；未配置时自动降级为系统语音，不影响其它功能。

## 安装

DSH 桌面版**完全退出**后，在终端里：

```powershell
dsh plugin --profile desktop add github:OWNER/dsh-fairy-mode
```

没有把 `dsh` 加进 PATH 的话用完整路径（Windows 默认安装位置）：

```powershell
& "$env:LOCALAPPDATA\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd" plugin --profile desktop add github:OWNER/dsh-fairy-mode
```

> 若你的安装目录不同，找到 `DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd` 即可。

然后**完全重启 DSH**。皮肤立刻生效，模式列表里出现 `Fairy模式` 且是默认。

也可以直接在对话里对 Agent 说一句：

```
安装 https://github.com/OWNER/dsh-fairy-mode
```

Agent 会据此执行上面的命令。

## 安装后你得到什么

| 位置 | 内容 |
|---|---|
| `profiles\desktop\node_modules\dsh-fairy-mode` | 插件本体（皮肤 + 预设补丁） |
| `dsh.profile.bundles` | 追加 `dsh-fairy-mode`（pnpm 安装后由 DSH 自动激活；没自动激活就手工加一行） |
| `cordis.patch.yml` | 不需要手改：预设与默认模式都来自插件自带的 bundle 补丁 |

## 可选：Fairy 的声音

包内**不含**语音模型（权重与声线属于游戏素材，不能随包分发）。想用自己的声线：

1. 部署 GPT-SoVITS v2，把微调好的 `*.pth` / `*.ckpt` 与参考音频放进一个目录；
2. 写一个启动脚本（参考 `voice/run-api.ps1.example`），用 `-c` 指向自己的 `tts_infer.yaml`；
3. 启动 DSH 前设置环境变量（不设则默认 `E:\FairyKit`）：

```powershell
[Environment]::SetEnvironmentVariable('FAIRYKIT_HOME', 'D:\FairyKit', 'User')
```

插件会找 `%FAIRYKIT_HOME%\run-api.ps1`、`%FAIRYKIT_HOME%\voice\tts_infer_fairy.yaml`，并在朗读开关打开时拉起、关闭时结束进程树。找不到就显示「未配置」，皮肤与人格照常工作。

## 可选：开屏动画

包内不含 `boot.mp4`（《绝区零》官方过场，版权归 miHoYo，不能随包分发）。想有开屏：

- 把你自己的 `boot.mp4` 放到插件目录（`...\node_modules\dsh-fairy-mode\boot.mp4`），重启即可；
- 没有它时会显示 `boot-field.png` 背景 + 徽记，不会报错。

## 卸载

```powershell
dsh plugin --profile desktop remove dsh-fairy-mode
```

再完全重启。若 `dsh.profile.bundles` 里还留着名字，删掉那一行。

## 版权

| 素材 | 说明 |
|---|---|
| 皮肤代码、布局、动画、预设文本 | MIT，可自由修改再分发 |
| `boot-field.png` | 随包提供 |
| `boot.mp4` | **未包含**，版权归 miHoYo／HoYoverse |
| 语音权重与参考音频 | **未包含**，版权归 miHoYo／HoYoverse |

本项目与米哈游无关联，仅供个人使用。
