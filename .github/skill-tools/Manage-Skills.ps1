param(
    [ValidateSet('Inspect', 'Install', 'Verify')]
    [string]$Mode = 'Verify',
    [string]$Workspace = (Get-Location).Path,
    [string]$InventoryPath = '',
    [switch]$RepairLinks
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$headers = @{ 'User-Agent' = 'Copilot-Skill-Preparation'; Accept = 'application/vnd.github+json' }
$github = Join-Path $Workspace '.github'
$skillRoot = Join-Path $github 'skills'
$lockPath = Join-Path $github 'skills-lock.json'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$selection = @(
    @{ Repo = 'MengTo/Skills'; Path = 'agent-skills/web-design/cinematic-gsap-lenis-motion-system'; Name = 'cinematic-gsap-lenis-motion-system' },
    @{ Repo = 'greensock/gsap-skills'; Path = 'skills/gsap-react'; Name = 'gsap-react' },
    @{ Repo = 'greensock/gsap-skills'; Path = 'skills/gsap-plugins'; Name = 'gsap-plugins' },
    @{ Repo = 'anthropics/skills'; Path = 'skills/frontend-design'; Name = 'frontend-design' },
    @{ Repo = 'ghaida/intent'; Path = 'skills/storytelling'; Name = 'storytelling' },
    @{ Repo = 'vercel-labs/agent-skills'; Path = 'skills/composition-patterns'; Name = 'vercel-composition-patterns' },
    @{ Repo = 'vercel-labs/agent-skills'; Path = 'skills/react-best-practices'; Name = 'vercel-react-best-practices' },
    @{ Repo = 'muxinc/skills'; Path = 'skills/mux-docs'; Name = 'mux-video' },
    @{ Repo = 'secondsky/claude-skills'; Path = 'plugins/mobile-first-design/skills/mobile-first-design'; Name = 'mobile-first-design' },
    @{ Repo = 'addyosmani/web-quality-skills'; Path = 'skills/accessibility'; Name = 'accessibility' },
    @{ Repo = 'addyosmani/web-quality-skills'; Path = 'skills/performance'; Name = 'performance' }
)

function Read-SkillHeader([string]$Text, [string]$ExpectedName) {
    $header = [regex]::Match($Text, '\A---\r?\n(?<body>[\s\S]*?)\r?\n---(?:\r?\n|$)')
    if (-not $header.Success) { throw "Missing frontmatter: $ExpectedName" }
    $body = $header.Groups['body'].Value
    $name = [regex]::Match($body, '(?m)^name:\s*([a-z0-9-]+)\s*$')
    if (-not $name.Success -or $name.Groups[1].Value -ne $ExpectedName) { throw "Invalid skill name: $ExpectedName" }
    if ($ExpectedName.Length -gt 64) { throw "Skill name too long: $ExpectedName" }
    $description = [regex]::Match($body, '(?m)^description:\s*\S')
    if (-not $description.Success) { throw "Missing description: $ExpectedName" }
    if ($body.Contains("`t")) { throw "Tabs in frontmatter: $ExpectedName" }
    if ($body -match '(?m)^disable-model-invocation:\s*true') { throw "Automatic invocation disabled: $ExpectedName" }
}

function Verify-Skills {
    $lock = Get-Content -LiteralPath $lockPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $discovered = @(Get-ChildItem -LiteralPath $skillRoot -Recurse -File -Filter 'SKILL.md')
    if ($discovered.Count -ne $selection.Count) { throw "Unexpected discovered skill count: $($discovered.Count)" }
    foreach ($entry in $lock.skills) {
        $directory = Join-Path $skillRoot $entry.name
        $document = Join-Path $directory 'SKILL.md'
        Read-SkillHeader (Get-Content -LiteralPath $document -Raw -Encoding UTF8) $entry.name
        foreach ($file in $entry.files) {
            $installed = Join-Path $Workspace $file.localPath
            if (-not (Test-Path -LiteralPath $installed -PathType Leaf)) { throw "Missing file: $installed" }
            $hash = (Get-FileHash -LiteralPath $installed -Algorithm SHA256).Hash.ToLowerInvariant()
            if ($hash -ne $file.sha256) { throw "Changed file: $installed" }
            if ($installed.EndsWith('.md')) {
                $text = Get-Content -LiteralPath $installed -Raw -Encoding UTF8
                foreach ($link in [regex]::Matches($text, '\]\((?<target>[^\s)]+)\)')) {
                    $target = $link.Groups['target'].Value.Split('#')[0]
                    if (-not $target -or $target -match '^([a-z]+:|/|\$|\{)') { continue }
                    $linkedFile = Join-Path ([IO.Path]::GetDirectoryName($installed)) $target
                    if (-not (Test-Path -LiteralPath $linkedFile)) {
                        $alternative = Join-Path (Join-Path $directory 'rules') ($target -replace '^\./', '')
                        if ($RepairLinks -and $target.StartsWith('./') -and (Test-Path -LiteralPath $alternative)) {
                            $newTarget = './rules/' + $target.Substring(2)
                            if (-not $file.PSObject.Properties['upstreamSha256']) { $file | Add-Member -NotePropertyName upstreamSha256 -NotePropertyValue $file.sha256 }
                            $adaptations = @()
                            if ($file.PSObject.Properties['linkAdaptations']) { $adaptations = @($file.linkAdaptations) }
                            $adaptations += [ordered]@{ original = $target; replacement = $newTarget }
                            $file | Add-Member -NotePropertyName linkAdaptations -NotePropertyValue $adaptations -Force
                            $text = $text.Replace('](' + $target + ')', '](' + $newTarget + ')')
                            [IO.File]::WriteAllText($installed, $text, $utf8)
                            $file.sha256 = (Get-FileHash -LiteralPath $installed -Algorithm SHA256).Hash.ToLowerInvariant()
                        }
                        else { throw "Broken local link in $installed : $target" }
                    }
                }
            }
        }
        Write-Output "OK $($entry.name): $($entry.files.Count) files, commit $($entry.commit)"
    }
    if ($RepairLinks) { [IO.File]::WriteAllText($lockPath, ($lock | ConvertTo-Json -Depth 12), $utf8) }
    Write-Output "VERIFIED: $($discovered.Count) skills; required metadata, installation paths and SHA256 integrity."
    foreach ($tool in @('node', 'npm', 'git')) {
        $command = Get-Command $tool -ErrorAction SilentlyContinue
        if ($command) { Write-Output "TOOL $tool : $($command.Source)" }
        else { Write-Output "TOOL $tool : not available in PATH; application setup remains pending." }
    }
}

function Install-Snapshot([string]$SnapshotPath) {
    $snapshot = Get-Content -LiteralPath $SnapshotPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($snapshot.skills.Count -ne $selection.Count) { throw 'Unexpected snapshot selection.' }
    foreach ($entry in $snapshot.skills) {
        if (-not ($selection | Where-Object { $_.Name -eq $entry.name -and $_.Repo -eq $entry.repository -and $_.Path -eq $entry.sourceDirectory })) { throw "Unapproved skill: $($entry.name)" }
        if (Test-Path -LiteralPath (Join-Path $skillRoot $entry.name)) { throw "Refusing to overwrite skill: $($entry.name)" }
        foreach ($file in $entry.files) {
            $staged = Join-Path $snapshot.stagingDirectory $file.localPath
            if ((Get-FileHash -LiteralPath $staged -Algorithm SHA256).Hash.ToLowerInvariant() -ne $file.sha256) { throw "Staging integrity failure: $staged" }
        }
    }
    foreach ($entry in $snapshot.skills) {
        foreach ($file in $entry.files) {
            if (-not $file.localPath.EndsWith('.md')) { continue }
            $staged = Join-Path $snapshot.stagingDirectory $file.localPath
            $text = Get-Content -LiteralPath $staged -Raw -Encoding UTF8
            $adapted = $text
            $rewrites = New-Object System.Collections.Generic.List[object]
            foreach ($link in [regex]::Matches($text, '\]\((?<target>\.\./[^\s)]+)\)')) {
                $target = $link.Groups['target'].Value
                $localTarget = Join-Path ([IO.Path]::GetDirectoryName($staged)) ($target.Split('#')[0])
                if (Test-Path -LiteralPath $localTarget) { continue }
                $base = [uri]("https://github.com/$($entry.repository)/blob/$($entry.commit)/$($file.sourcePath)")
                $remote = (New-Object System.Uri($base, $target)).AbsoluteUri
                $adapted = $adapted.Replace('](' + $target + ')', '](' + $remote + ')')
                $rewrites.Add([ordered]@{ original = $target; replacement = $remote })
            }
            if ($rewrites.Count -gt 0) {
                $file | Add-Member -NotePropertyName upstreamSha256 -NotePropertyValue $file.sha256
                $file | Add-Member -NotePropertyName linkAdaptations -NotePropertyValue $rewrites.ToArray()
                [IO.File]::WriteAllText($staged, $adapted, $utf8)
                $file.sha256 = (Get-FileHash -LiteralPath $staged -Algorithm SHA256).Hash.ToLowerInvariant()
            }
        }
    }
    [IO.Directory]::CreateDirectory($skillRoot) | Out-Null
    foreach ($entry in $snapshot.skills) {
        $stagedDirectory = Join-Path $snapshot.stagingDirectory ('.github/skills/' + $entry.name)
        Copy-Item -LiteralPath $stagedDirectory -Destination (Join-Path $skillRoot $entry.name) -Recurse
    }
    [IO.File]::WriteAllText($lockPath, ($snapshot | ConvertTo-Json -Depth 12), $utf8)
    Verify-Skills
}

if ($Mode -eq 'Verify') {
    Verify-Skills
    return
}
if ($Mode -eq 'Install' -and $InventoryPath) {
    Install-Snapshot $InventoryPath
    return
}

$stage = Join-Path ([IO.Path]::GetTempPath()) ('boda-skills-' + [guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($stage) | Out-Null
$sources = @{}
$entries = New-Object System.Collections.Generic.List[object]
foreach ($item in $selection) {
    if (-not $sources.ContainsKey($item.Repo)) {
        $commits = @(Invoke-RestMethod -Uri "https://api.github.com/repos/$($item.Repo)/commits?per_page=1" -Headers $headers)
        $commit = $commits[0].sha
        $tree = Invoke-RestMethod -Uri "https://api.github.com/repos/$($item.Repo)/git/trees/${commit}?recursive=1" -Headers $headers
        if ($tree.truncated) { throw "Truncated source tree: $($item.Repo)" }
        $sources[$item.Repo] = @{ Commit = $commit; Date = $commits[0].commit.committer.date; Tree = $tree.tree }
    }
    $source = $sources[$item.Repo]
    $skillFiles = @($source.Tree | Where-Object { $_.type -eq 'blob' -and $_.path.StartsWith($item.Path + '/') -and ($_.path -match '\.(md|txt|json)$') })
    if (-not ($skillFiles | Where-Object { $_.path -eq ($item.Path + '/SKILL.md') })) { throw "Skill no longer exists: $($item.Repo)/$($item.Path)" }
    $licenses = @($source.Tree | Where-Object { $_.type -eq 'blob' -and $_.path -match '^(LICENSE|LICENSE\.md|LICENSE\.txt)$' })
    $records = New-Object System.Collections.Generic.List[object]
    foreach ($file in (@($skillFiles) + @($licenses))) {
        if ($file.size -gt 2000000) { throw "Oversized skill resource: $($file.path)" }
        $relative = if ($file.path.StartsWith($item.Path + '/')) { $file.path.Substring($item.Path.Length + 1) } else { 'UPSTREAM-' + $file.path }
        $localPath = '.github/skills/' + $item.Name + '/' + $relative
        $staged = Join-Path $stage $localPath
        [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($staged)) | Out-Null
        $url = "https://raw.githubusercontent.com/$($item.Repo)/$($source.Commit)/$($file.path)"
        Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -OutFile $staged
        $records.Add([ordered]@{ sourcePath = $file.path; localPath = $localPath; sha256 = (Get-FileHash -LiteralPath $staged -Algorithm SHA256).Hash.ToLowerInvariant() })
    }
    $skillText = Get-Content -LiteralPath (Join-Path $stage ('.github/skills/' + $item.Name + '/SKILL.md')) -Raw -Encoding UTF8
    Read-SkillHeader $skillText $item.Name
    $entry = [ordered]@{ name = $item.Name; repository = $item.Repo; sourceDirectory = $item.Path; commit = $source.Commit; lastRepositoryCommit = $source.Date; files = $records.ToArray(); omittedExecutableResources = @($source.Tree | Where-Object { $_.type -eq 'blob' -and $_.path.StartsWith($item.Path + '/') -and $_.path -notmatch '\.(md|txt|json)$' } | ForEach-Object { $_.path }) }
    $entries.Add($entry)
    Write-Output "REVIEW $($item.Name): $($records.Count) documentation files; repo commit $($source.Date)"
}

$inventory = [ordered]@{ schemaVersion = 1; capturedAtUtc = [DateTime]::UtcNow.ToString('o'); scope = 'workspace'; agent = 'github-copilot'; installMethod = 'Reviewed documentation copied from pinned GitHub commits; no remote code executed'; stagingDirectory = $stage; skills = $entries.ToArray() }
$inventoryPath = Join-Path $stage 'inventory.json'
[IO.File]::WriteAllText($inventoryPath, ($inventory | ConvertTo-Json -Depth 12), $utf8)
Write-Output "INVENTORY: $inventoryPath"

if ($Mode -eq 'Inspect') { return }
Install-Snapshot $inventoryPath