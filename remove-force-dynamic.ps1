# Batch remove force-dynamic declarations
$files = @(
    "src/app/analytics/layout.tsx",
    "src/app/dashboard/routine/layout.tsx",
    "src/app/dashboard/summaries/layout.tsx",
    "src/app/focus/layout.tsx",
    "src/app/goals/layout.tsx",
    "src/app/notifications/layout.tsx",
    "src/app/ppadminpp/layout.tsx",
    "src/app/settings/ai/page.tsx",
    "src/app/settings/categories/page.tsx",
    "src/app/settings/export/page.tsx",
    "src/app/settings/integrations/layout.tsx",
    "src/app/settings/notifications/page.tsx",
    "src/app/settings/page.tsx",
    "src/app/settings/profile/page.tsx",
    "src/app/settings/security/page.tsx",
    "src/app/settings/sounds/page.tsx",
    "src/app/settings/theme/page.tsx",
    "src/app/settings/timer/page.tsx",
    "src/app/settings/wallpaper/page.tsx",
    "src/app/timer/layout.tsx"
)

foreach ($file in $files) {
    $path = Join-Path "d:\DayFlow\web" $file
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        # Remove the force-dynamic declaration and its comment
        $content = $content -replace "(?m)^.*//.*Force dynamic.*\r?\n", ""
        $content = $content -replace "(?m)^export const dynamic = ['`\"]force-dynamic['`\"];\r?\n", ""
        $content = $content -replace "(?m)^export const dynamic = ['`\"]force-dynamic['`\"];", ""
        # Remove extra blank lines
        $content = $content -replace "(\r?\n){3,}", "`r`n`r`n"
        Set-Content -Path $path -Value $content -NoNewline
        Write-Host "Updated: $file"
    }
}

Write-Host "Done removing force-dynamic declarations"
