# Test Members API Endpoints

$baseUrl = "http://localhost:3001/api"
$headers = @{
    "Authorization" = "Bearer test-token"
    "Content-Type" = "application/json"
}

Write-Host "Testing Members API..." -ForegroundColor Cyan

# Test 1: Get all members
Write-Host "`n1. GET /api/members" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/members" -Headers $headers -Method GET
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Success: $($content.success)"
    Write-Host "Total items: $($content.data.items.Count)"
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

# Test 2: Health check
Write-Host "`n2. GET /api/health" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Message: $($content.message)"
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Search members
Write-Host "`n3. GET /api/members/search?q=test" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/members/search?q=test" -Headers $headers -Method GET
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Success: $($content.success)"
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI Tests completed!" -ForegroundColor Cyan
