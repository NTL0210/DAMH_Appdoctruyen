# Generate JWT Secret for Railway Deployment
# Run this script to generate a secure JWT secret

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "JWT Secret Generator" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Generate random bytes and convert to base64
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)

Write-Host "Your JWT Secret (Base64):" -ForegroundColor Green
Write-Host $secret -ForegroundColor Yellow
Write-Host ""

# Generate hex version
$hexSecret = -join ($bytes | ForEach-Object { $_.ToString("x2") })
Write-Host "Your JWT Secret (Hex):" -ForegroundColor Green
Write-Host $hexSecret -ForegroundColor Yellow
Write-Host ""

Write-Host "Copy one of the above secrets and use it as JWT_SECRET in Railway!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
