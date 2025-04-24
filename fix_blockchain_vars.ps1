# PowerShell script to fix immutable blockchain variables
$apiFile = "c:\Users\Hemanth Reddy\Desktop\Blockchain-Based Electronic Health Records System\blockchain-backend\src\api.rs"
$content = Get-Content $apiFile -Raw
$newContent = $content -replace "let blockchain = blockchain\.lock\(\)\.unwrap\(\);", "let mut blockchain = blockchain.lock().unwrap();"
Set-Content -Path $apiFile -Value $newContent
