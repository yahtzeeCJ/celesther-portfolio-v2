$file = "src\types\content.ts"
$content = [System.IO.File]::ReadAllText((Resolve-Path $file))

# Add intro fields to interface
$old1 = "    // Theme Customization`r`n    themePrimaryColor1: string;"
$new1 = "    // Theme Customization`r`n    introEnabled: boolean;`r`n    introText1: string;`r`n    introText2: string;`r`n    themePrimaryColor1: string;"
$content = $content.Replace($old1, $new1)

# Add intro defaults
$old2 = "    // Theme Defaults`r`n    themePrimaryColor1: '#0ea5e9', // Blue"
$new2 = "    // Theme Defaults`r`n    introEnabled: true,`r`n    introText1: 'Celesther John',`r`n    introText2: 'Portfolio',`r`n    themePrimaryColor1: '#0ea5e9', // Blue"
$content = $content.Replace($old2, $new2)

[System.IO.File]::WriteAllText((Resolve-Path $file), $content)
Write-Host "Done patching content.ts"
