# Deploys the optional voice stack for dsh-fairy-mode.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File setup-voice.ps1
#
# What it installs, all of it outside the DSH profile (default <FAIRYKIT_HOME>):
#   <Home>\gpt-sovits   GPT-SoVITS v2 checkout (pinned commit)
#   <Home>\venv         python venv: torch + the runtime's requirements, with the
#                       version pins this voice is known to work with
#   <Home>\voice        the fine-tuned weights from voice/weights.json, the
#                       reference clip, and tts_infer_fairy.yaml
#   <Home>\run-api.ps1  the launcher the overlay starts/stops with the pill
#
# Roughly 5 GB of downloads (torch ~2.5 GB, pretrained models ~1.4 GB, G2PW 562 MB,
# weights 240 MB). Everything is skip-if-present, so re-running resumes or repairs
# instead of starting over; pass -Force to redo a step.
#
#   -Cpu          CPU torch (smaller, slower) instead of cu121
#   -SkipModels   weights + config only, for a runtime that already exists
#   -SkipWeights  runtime only
#   -NoEnvVar     do not write the user-level FAIRYKIT_HOME

param(
    [Alias('Home')][string]$FairyHome = $(if ($env:FAIRYKIT_HOME) { $env:FAIRYKIT_HOME } else { Join-Path $env:USERPROFILE 'FairyKit' }),
    [switch]$Cpu,
    [switch]$SkipModels,
    [switch]$SkipWeights,
    [switch]$NoEnvVar,
    [switch]$Force,
    [string]$Mirror = 'https://hf-mirror.com',
    [string]$RepoCommit = 'b4570b876f5c086819ba84e3215472733c6a7b70'
)

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$package = Split-Path $here -Parent
$FairyHome = [IO.Path]::GetFullPath($FairyHome)
$gptRoot = Join-Path $FairyHome 'gpt-sovits'
$venv = Join-Path $FairyHome 'venv'
$venvPy = Join-Path $venv 'Scripts\python.exe'
$venvPyW = Join-Path $venv 'Scripts\pythonw.exe'
$voiceDir = Join-Path $FairyHome 'voice'
$logs = Join-Path $FairyHome 'logs'
$downloads = Join-Path $FairyHome 'downloads'
$config = Join-Path $voiceDir 'tts_infer_fairy.yaml'
$launcher = Join-Path $FairyHome 'run-api.ps1'
$stateLog = Join-Path $logs 'setup-voice.log'
$utf8 = New-Object System.Text.UTF8Encoding($false)

New-Item -ItemType Directory -Force -Path $FairyHome, $voiceDir, $logs, $downloads | Out-Null

function Write-Log([string]$Message) {
    $line = '{0} {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
    Write-Host $line
    try { [IO.File]::AppendAllText($stateLog, $line + "`r`n", $utf8) } catch { }
}

function Step([string]$Message) {
    Write-Host ''
    Write-Log ("== " + $Message)
}

function Fail([string]$Message) {
    Write-Log ('FAILED: ' + $Message)
    exit 1
}

function Get-File([string]$Url, [string]$Destination, [long]$ExpectedBytes = 0) {
    $name = Split-Path $Destination -Leaf
    if ((Test-Path $Destination) -and -not $Force) {
        $size = (Get-Item $Destination).Length
        if ($ExpectedBytes -le 0 -or $size -eq $ExpectedBytes) {
            Write-Log ("    present: $name (" + [math]::Round($size / 1MB) + " MB)")
            return
        }
    }
    Write-Log ("    downloading $name")
    $curlArgs = @('-L', '--fail', '--retry', '4', '--retry-delay', '5', '--connect-timeout', '30', '-C', '-', '-o', $Destination, $Url)
    & curl.exe @curlArgs
    if ($LASTEXITCODE -ne 0) { Fail "download failed: $Url" }
    $size = (Get-Item $Destination).Length
    if ($ExpectedBytes -gt 0 -and $size -ne $ExpectedBytes) { Fail "size mismatch for $name ($size != $ExpectedBytes)" }
    Write-Log ("    downloaded $name (" + [math]::Round($size / 1MB) + " MB)")
}

function Get-Python {
    $candidates = @()
    if (Get-Command py -ErrorAction SilentlyContinue) { $candidates += @('py', '-3.11') }
    if (Get-Command python -ErrorAction SilentlyContinue) { $candidates += @('python') }
    foreach ($candidate in $candidates) {
        try {
            $version = & $candidate[0] @($candidate[1..($candidate.Count - 1)]) -c "import sys;print('%d.%d' % sys.version_info[:2])" 2>$null
            if ($LASTEXITCODE -eq 0 -and $version -match '^3\.(1[0-2])$') { return ,$candidate }
        } catch { }
    }
    return $null
}

Write-Log "dsh-fairy-mode voice setup"
Write-Log "home: $FairyHome"
Write-Log "package: $package"

# ---------------------------------------------------------------- prerequisites
Step 'checking prerequisites'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Fail 'git is required (https://git-scm.com)' }
if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) { Fail 'curl.exe is required (ships with Windows 10+)' }
$free = (Get-PSDrive ([IO.Path]::GetPathRoot($FairyHome).TrimEnd('\').TrimEnd(':'))).Free
if ($free -lt 8GB) { Fail ("need at least 8 GB free on " + [IO.Path]::GetPathRoot($FairyHome) + ", found " + [math]::Round($free / 1GB, 1) + " GB") }
Write-Log ("    git ok, curl ok, free space " + [math]::Round($free / 1GB, 1) + " GB")

# ---------------------------------------------------------------- 1. runtime
Step '1/6 GPT-SoVITS checkout'
if (-not (Test-Path (Join-Path $gptRoot 'api_v2.py')) -or $Force) {
    if (Test-Path $gptRoot) { Remove-Item -LiteralPath $gptRoot -Recurse -Force }
    & git clone --depth 1 https://github.com/RVC-Boss/GPT-SoVITS.git $gptRoot
    if ($LASTEXITCODE -ne 0) { Fail 'git clone failed; check network or use a proxy' }
    & git -C $gptRoot fetch --depth 1 origin $RepoCommit 2>$null
    if ($LASTEXITCODE -eq 0) { & git -C $gptRoot checkout -q $RepoCommit }
} else {
    Write-Log '    present'
}
$head = (& git -C $gptRoot log -1 --format='%h') 2>$null
Write-Log ("    runtime commit " + $head)
$headFull = (& git -C $gptRoot log -1 --format='%H') 2>$null
if ($headFull -ne $RepoCommit) { Write-Log ("    note: kown-good commit is " + $RepoCommit.Substring(0, 12) + "; this voice was validated on it") }

# ---------------------------------------------------------------- 2. venv
Step '2/6 python environment'
if (-not (Test-Path $venvPy) -or $Force) {
    $py = Get-Python
    if ($null -eq $py) { Fail 'python 3.10-3.12 not found; install Python 3.11 and re-run' }
    $exe = $py[0]
    $exeArgs = @($py[1..($py.Count - 1)])
    & $exe @exeArgs -m venv $venv
    if ($LASTEXITCODE -ne 0) { Fail 'venv creation failed' }
}
Write-Log ('    venv python ' + (& $venvPy -c "import sys;print(sys.version.split()[0])"))

Step '3/6 torch'
$torchIndex = if ($Cpu) { 'https://download.pytorch.org/whl/cpu' } else { 'https://download.pytorch.org/whl/cu121' }
& $venvPy -m pip install --upgrade pip --quiet
& $venvPy -m pip install --no-input --prefer-binary "numpy<2" --quiet
$torchCheck = & $venvPy -c "import torch,sys;print(torch.__version__)" 2>$null
if ($LASTEXITCODE -ne 0 -or $Force) {
    Write-Log "    installing torch from $torchIndex (several GB)"
    & $venvPy -m pip install --no-input torch torchaudio --index-url $torchIndex
    if ($LASTEXITCODE -ne 0) { Fail 'torch install failed' }
} else {
    Write-Log ("    present: torch " + $torchCheck)
}

Step '4/6 runtime requirements'
$requirements = Get-Content (Join-Path $gptRoot 'requirements.txt')
$filtered = $requirements | Where-Object {
    $_ -notmatch '^--no-binary' -and $_ -notmatch '^gradio' -and $_ -notmatch '^onnxruntime' -and
    $_ -notmatch '^torchaudio' -and $_ -notmatch '^tensorboard' -and $_.Trim() -ne ''
}
$requirementsFile = Join-Path $downloads 'requirements-filtered.txt'
[IO.File]::WriteAllLines($requirementsFile, $filtered, $utf8)
Write-Log ("    filtered " + $filtered.Count + " requirements (gradio/onnxruntime/tensorboard/torchaudio excluded)")
& $venvPy -m pip install --no-input --prefer-binary -r $requirementsFile
if ($LASTEXITCODE -ne 0) { Fail 'pip install failed; see the output above' }
# Pinned because newer transformers refuses torch.load on torch < 2.6 (CVE gate),
# and the vocoder path needs matplotlib/resampy even though requirements omit them.
& $venvPy -m pip install --no-input --prefer-binary "transformers==4.51.3" matplotlib resampy --quiet
if ($LASTEXITCODE -ne 0) { Fail 'pinned extra packages failed' }

# ---------------------------------------------------------------- 3. models
if (-not $SkipModels) {
    Step '4/6 pretrained models (~2 GB)'
    $pmZip = Join-Path $downloads 'pretrained_models.zip'
    $g2pwZip = Join-Path $downloads 'G2PWModel.zip'
    $nltkZip = Join-Path $downloads 'nltk_data.zip'
    $haveModels = Test-Path (Join-Path $gptRoot 'GPT_SoVITS\pretrained_models\chinese-roberta-wwm-ext-large\pytorch_model.bin')
    $haveG2pw = Test-Path (Join-Path $gptRoot 'GPT_SoVITS\text\G2PWModel\g2pW.onnx')
    $haveNltk = Test-Path (Join-Path $venv 'nltk_data\corpora\cmudict')
    if (-not $Force -and $haveModels -and $haveG2pw -and $haveNltk) {
        Write-Log '    every model directory is already in place; skipping the downloads'
    } else {
        if ($Force -or -not $haveModels) { Get-File "$Mirror/XXXXRT/GPT-SoVITS-Pretrained/resolve/main/pretrained_models.zip" $pmZip 4563188367 }
        if ($Force -or -not $haveG2pw) { Get-File "$Mirror/XXXXRT/GPT-SoVITS-Pretrained/resolve/main/G2PWModel.zip" $g2pwZip }
        if ($Force -or -not $haveNltk) { Get-File "$Mirror/XXXXRT/GPT-SoVITS-Pretrained/resolve/main/nltk_data.zip" $nltkZip }
    }

    $extract = Join-Path $here 'extract-models.py'
    if (-not (Test-Path (Join-Path $gptRoot 'GPT_SoVITS\pretrained_models\chinese-hubert-base\pytorch_model.bin')) -or $Force) {
        & $venvPy $extract $pmZip $gptRoot $venv models
        if ($LASTEXITCODE -ne 0) { Fail 'pretrained extraction failed' }
    } else { Write-Log '    hubert/roberta present' }
    if (-not (Test-Path (Join-Path $gptRoot 'GPT_SoVITS\text\G2PWModel\g2pW.onnx')) -or $Force) {
        & $venvPy $extract $g2pwZip $gptRoot $venv g2pw
        if ($LASTEXITCODE -ne 0) { Fail 'G2PW extraction failed' }
    } else { Write-Log '    G2PW present' }
    if (-not (Test-Path (Join-Path $venv 'nltk_data\corpora\cmudict')) -or $Force) {
        & $venvPy $extract $nltkZip $gptRoot $venv nltk
        if ($LASTEXITCODE -ne 0) { Fail 'nltk data extraction failed' }
    } else { Write-Log '    nltk data present' }
}

# ---------------------------------------------------------------- 4. weights
if (-not $SkipWeights) {
    Step '5/6 fine-tuned weights'
    $manifest = [IO.File]::ReadAllText((Join-Path $package 'voice\weights.json'), [Text.Encoding]::UTF8) | ConvertFrom-Json
    foreach ($file in $manifest.files) {
        $target = Join-Path $voiceDir $file.name
        $ok = $false
        if ((Test-Path $target) -and -not $Force) {
            if (-not $file.sha256 -or (Get-FileHash $target -Algorithm SHA256).Hash.ToLower() -eq $file.sha256) { $ok = $true }
        }
        if (-not $ok) {
            Get-File $file.url $target $(if ($file.bytes) { [long]$file.bytes } else { 0 })
            if ($file.sha256 -and (Get-FileHash $target -Algorithm SHA256).Hash.ToLower() -ne $file.sha256) {
                Remove-Item $target -Force
                Fail ("sha256 mismatch for " + $file.name)
            }
        }
        Write-Log ("    ok: " + $file.name)
    }
    $refSource = Join-Path $package 'fairy_ref.wav'
    $refTarget = Join-Path $voiceDir $manifest.reference.file
    if ((Test-Path $refSource) -and -not (Test-Path $refTarget)) { Copy-Item $refSource $refTarget -Force; Write-Log ('    copied ' + $manifest.reference.file) }
}

# ---------------------------------------------------------------- 5. config + launcher
Step '6/6 config and launcher'
$template = [IO.File]::ReadAllText((Join-Path $package 'voice\tts_infer_fairy.yaml.template'), [Text.Encoding]::UTF8)
$rendered = $template.Replace('__HOME__', ($FairyHome -replace '\\', '/')).Replace('__GPT_SOVITS__', ($gptRoot -replace '\\', '/'))
if ($Cpu) { $rendered = $rendered.Replace('device: cuda', 'device: cpu').Replace('is_half: true', 'is_half: false') }
[IO.File]::WriteAllText($config, $rendered, $utf8)
Write-Log ("    wrote " + $config)

$launcherTemplate = [IO.File]::ReadAllText((Join-Path $package 'scripts\run-api.ps1.template'), [Text.Encoding]::UTF8)
$pythonForLaunch = if (Test-Path $venvPyW) { $venvPyW } else { $venvPy }
$launcherText = $launcherTemplate.Replace('__HOME__', $FairyHome).Replace('__GPT_SOVITS__', $gptRoot).Replace('__PYTHON__', $pythonForLaunch).Replace('__CONFIG__', $config)
[IO.File]::WriteAllText($launcher, $launcherText, $utf8)
Write-Log ("    wrote " + $launcher)

if (-not $NoEnvVar) {
    [Environment]::SetEnvironmentVariable('FAIRYKIT_HOME', $FairyHome, 'User')
    $env:FAIRYKIT_HOME = $FairyHome
    Write-Log ("    FAIRYKIT_HOME (user) = " + $FairyHome)
}

# ---------------------------------------------------------------- smoke test
Step 'smoke test'
$probe = Join-Path $here 'smoke-import.py'
Push-Location $gptRoot
try {
    & $venvPy $probe $gptRoot (Join-Path $gptRoot 'GPT_SoVITS')
    if ($LASTEXITCODE -ne 0) { Fail 'the runtime does not import; the voice will report 未配置' }
} finally {
    Pop-Location
}

Write-Log ''
Write-Log 'done. Restart DSH, then flip the read-aloud pill: it will load the model on demand.'
Write-Log ("config: " + $config)
Write-Log ("launcher: " + $launcher)
