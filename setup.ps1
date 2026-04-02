# cstack setup script (Windows PowerShell)
# Installs cstack agents, prompts, and copilot instructions into your project or globally.
#
# VS Code skill/agent discovery paths:
#   Project-local:  .agents\skills\  and  .github\agents\
#   Global:         %APPDATA%\Code\User\agents\skills\  and  %USERPROFILE%\.github\agents\

param(
    [switch]$Local,
    [switch]$Help
)

$CstackDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if ($Help) {
    Write-Host "Usage: .\setup.ps1 [-Local]"
    Write-Host ""
    Write-Host "  -Local    Install into current project (.agents\skills\ and .github\agents\)"
    Write-Host "            Default: install globally (AppData\Code\User\agents\skills\ and .github\agents\)"
    exit 0
}

if ($Local) {
    # Find the project root — nearest .git repo that isn't cstack itself
    $ProjectRoot = $null
    $SearchDir = (Get-Location).Path
    while ($SearchDir -ne [System.IO.Path]::GetPathRoot($SearchDir)) {
        if ((Test-Path "$SearchDir\.git") -and ($SearchDir -ne $CstackDir)) {
            $ProjectRoot = $SearchDir
            break
        }
        $SearchDir = Split-Path -Parent $SearchDir
    }
    if (-not $ProjectRoot) {
        Write-Warning "Could not find a parent git repo. Defaulting to two levels up from cstack."
        $ProjectRoot = Split-Path -Parent (Split-Path -Parent $CstackDir)
    }
    $SkillsDir       = "$ProjectRoot\.agents\skills"
    $AgentsDir       = "$ProjectRoot\.github\agents"
    $PromptsDir      = "$ProjectRoot\.github\prompts"
    $InstructionsFile = "$ProjectRoot\.github\copilot-instructions.md"
    Write-Host "📦 Installing cstack locally into $ProjectRoot\"
} else {
    $SkillsDir       = "$env:APPDATA\Code\User\agents\skills"
    $AgentsDir       = "$env:USERPROFILE\.github\agents"
    $PromptsDir      = "$env:USERPROFILE\.github\prompts"
    $InstructionsFile = "$env:USERPROFILE\.github\copilot-instructions.md"
    Write-Host "📦 Installing cstack globally into $env:APPDATA\Code\User\agents\skills\ and $env:USERPROFILE\.github\"
}

# Create directories
New-Item -ItemType Directory -Force -Path $SkillsDir  | Out-Null
New-Item -ItemType Directory -Force -Path $AgentsDir  | Out-Null
New-Item -ItemType Directory -Force -Path $PromptsDir | Out-Null

# Copy skills (each skill is a directory with SKILL.md)
Write-Host "→ Copying skills..."
Get-ChildItem -Path "$CstackDir\skills" -Directory | ForEach-Object {
    $SkillName = $_.Name
    $Dest = "$SkillsDir\$SkillName"
    New-Item -ItemType Directory -Force -Path $Dest | Out-Null
    Copy-Item -Path "$($_.FullName)\*" -Destination $Dest -Recurse -Force
}

# Copy agents
Write-Host "→ Copying agents..."
Copy-Item -Path "$CstackDir\agents\*.agent.md" -Destination $AgentsDir -Force

# Copy prompts (if any exist)
$PromptsSource = "$CstackDir\prompts"
if ((Test-Path $PromptsSource) -and (Get-ChildItem $PromptsSource)) {
    Write-Host "→ Copying prompts..."
    Copy-Item -Path "$PromptsSource\*" -Destination $PromptsDir -Recurse -Force
}

# Optionally append cstack block to copilot-instructions.md
$CstackBlock = "$CstackDir\.github\copilot-instructions.md"
if (Test-Path $CstackBlock) {
    $BlockContent = Get-Content $CstackBlock -Raw
    if (Test-Path $InstructionsFile) {
        $Existing = Get-Content $InstructionsFile -Raw
        if ($Existing -match "# BEGIN cstack") {
            Write-Host "→ copilot-instructions.md already contains cstack block, skipping."
        } else {
            Write-Host "→ Appending cstack block to copilot-instructions.md..."
            Add-Content -Path $InstructionsFile -Value "`n# BEGIN cstack`n$BlockContent`n# END cstack"
        }
    } else {
        Write-Host "→ Creating copilot-instructions.md..."
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $InstructionsFile) | Out-Null
        Set-Content -Path $InstructionsFile -Value "# BEGIN cstack`n$BlockContent`n# END cstack"
    }
}

Write-Host ""
Write-Host "✅ cstack installed successfully!"
Write-Host ""
Write-Host "Skills installed to: $SkillsDir"
Write-Host "Agents installed to: $AgentsDir"
Write-Host ""
Write-Host "Available skills:"
Write-Host "  /plan        Generate implementation plan"
Write-Host "  /implement   Execute PLAN.md step-by-step"
Write-Host "  /review      Staff-level code review"
Write-Host "  /test        Run tests and write coverage"
Write-Host "  /ship        Commit and open PR"
Write-Host "  /debug       Systematic root-cause debugging"
Write-Host ""
Write-Host "Available agents:"
Write-Host "  @planner     Read-only planning"
Write-Host "  @reviewer    Code review (reports only)"
Write-Host "  @implementer Full-edit implementation"
Write-Host "  @tester      Tester and test coverage"
Write-Host ""
Write-Host "Workflow: /plan → [implement] → /review → /test → /ship"
