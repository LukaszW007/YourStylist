function Get-FolderStructure($Path) {
    $items = Get-ChildItem -Path $Path
    $result = foreach ($item in $items) {
        $obj = [PSCustomObject]@{
            Nazwa     = $item.Name
            Typ       = if ($item.PSIsContainer) { "Folder" } else { "Plik" }
            Rozszerzenie = if ($item.PSIsContainer) { $null } else { $item.Extension }
        }

        if ($item.PSIsContainer) {
            # Je�li to folder, pobierz jego zawarto�� (rekurencja)
            $obj | Add-Member -MemberType NoteProperty -Name "Zawartosc" -Value (Get-FolderStructure -Path $item.FullName)
        }
        $obj
    }
    return $result
}

# --- KONFIGURACJA ---
# �cie�ka folderu, kt�ry chcesz przeskanowa� (kropka oznacza obecny folder)
$targetPath = "./src" 
# Nazwa pliku wynikowego
$outputFile = "struktura.json"

Write-Host "Generowanie struktury JSON... Prosz� czeka�." -ForegroundColor Cyan

$structure = Get-FolderStructure -Path $targetPath
$structure | ConvertTo-Json -Depth 100 | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "Gotowe! Wynik zapisano w pliku: $outputFile" -ForegroundColor Green