# DSH-Fairy-Mode

《绝区零》Fairy 模式的 DSH 插件包：**HDD 皮肤 + `Fairy模式` 预设 + 开屏动画**，一个包、一条命令，装完和作者的界面一致。

- 皮肤：深海军蓝 HDD 界面、网格 / 扫描线 / 掠光、左上徽记与字标、侧栏常驻 Fairy 徽记（呼吸 / 光环 / 每 3.6 秒单帧撕裂）、输入框右侧电费胶囊与朗读电平条。
- 开屏：`boot.mp4` 播完换成 `boot-field.png`，徽记飞回侧栏（`boot.mp4` 随包提供）。
- 人格：`Fairy模式` 预设（称谓体系、协议标签、数字癖、问候长度规则），工具集与 `standard` 完全一致，并设为新会话默认。
- 语音：可选接本地 GPT-SoVITS v2。点朗读才加载模型、关掉即释放；未配置时自动降级为系统语音，不影响其它功能。

## 安装

DSH 桌面版**完全退出**后，在终端里（仓库公开时）：

```powershell
dsh plugin --profile desktop add github:RengeRenge/DSH-Fairy-Mode
```

仓库是私有的、或者你想用 SSH，就用完整地址：

```powershell
dsh plugin --profile desktop add git+ssh://git@github.com/RengeRenge/DSH-Fairy-Mode.git
```

没把 `dsh` 加进 PATH 时用完整路径（Windows 默认安装位置）：

```powershell
& "$env:LOCALAPPDATA\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd" plugin --profile desktop add github:RengeRenge/DSH-Fairy-Mode
```

然后**完全重启 DSH**。皮肤立刻生效，模式列表里出现 `Fairy模式` 且是默认。

也可以在对话里直接说一句：

```
安装 https://github.com/RengeRenge/DSH-Fairy-Mode
```

## 安装后你得到什么

| 位置 | 内容 |
|---|---|
| `profiles\desktop\node_modules\dsh-fairy-mode` | 插件本体（皮肤、预设补丁、`boot.mp4`、`boot-field.png`、`fairy_ref.wav`） |
| `dsh.profile.bundles` | 追加 `dsh-fairy-mode`。pnpm 安装完成后 DSH 会自动把它加进 bundle 列表并激活；没自动加就手工补一行 |
| `cordis.patch.yml` | 不需要手改：`hdd-overlay` 行、`preset-fairy`、`selectedDefault: fairy` 都在插件自带的 bundle 补丁里 |

## 包内包含 / 不包含

| 资源 | 大小 | 是否包含 |
|---|---|---|
| `client.js` / `index.js` | ~160 KB | ✅ |
| `boot.mp4`（开屏动画） | 70.9 MB | ✅ |
| `boot-field.png`（开屏背景） | 0.9 MB | ✅ |
| `fairy_ref.wav`（朗读参考音频） | 0.5 MB | ✅ |
| GPT-SoVITS 运行时 | ~1.5 GB | ❌ 需自行部署 |
| 微调语音权重 `*.pth` / `*.ckpt` | ~240 MB | ❌ 见下 |

## 可选：Fairy 的声音

朗读默认走**系统语音**。要用 Fairy 的声线，需要自己准备两样东西：

1. **GPT-SoVITS v2 运行时**（本仓库不含，约 1.5 GB）；
2. **微调权重**（`*.pth` + `*.ckpt`，约 240 MB）。

权重没有随包分发有两个原因：GitHub 单文件上限 100 MB（`*.ckpt` 超了，必须上 LFS），以及它是游戏角色的声音素材。

放好之后：

```powershell
# 假设语音栈在 D:\FairyKit，需要其中的 run-api.ps1 与 voice\tts_infer_fairy.yaml
# （启动脚本可参考本仓库的 voice\run-api.ps1.example）
[Environment]::SetEnvironmentVariable('FAIRYKIT_HOME', 'D:\FairyKit', 'User')
```

插件会找 `%FAIRYKIT_HOME%\run-api.ps1` 和 `%FAIRYKIT_HOME%\voice\tts_infer_fairy.yaml`，朗读开关打开时拉起，关闭时结束进程树。找不到时胶囊显示「未配置」，皮肤与人格照常工作。

## 卸载

```powershell
dsh plugin --profile desktop remove dsh-fairy-mode
```

再完全重启。如果 `dsh.profile.bundles` 里还留着 `dsh-fairy-mode`，删掉那一行。

## 版权

| 素材 | 说明 |
|---|---|
| 皮肤代码、布局、动画、预设文本、README | MIT，可自由修改再分发 |
| `boot.mp4`、`fairy_ref.wav` | 《绝区零》官方素材，版权归 **miHoYo／HoYoverse**；本包按「个人使用」分发，**请勿商用或二次售卖** |
| 语音权重 | 社区微调权重，角色声音版权同上；本仓库不含 |

本项目与米哈游无关联。因为仓库里含有官方过场与角色音频，**建议把 GitHub 仓库设为 private**；公开传播的版权风险由仓库所有者承担。
