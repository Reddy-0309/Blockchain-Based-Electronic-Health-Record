# Test script to verify if the API is working

$baseUrl = "http://localhost:8000/api"

# Test 1: Create a health record
$createRecordPayload = @{
    data = "Patient health record data"
    record_type = "MedicalHistory"
    patient_id = "patient123"
    provider_id = "doctor456"
    timestamp = (Get-Date).ToString("o")
} | ConvertTo-Json

Write-Host "Test 1: Creating a health record..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/records/create" -Method Post -Body $createRecordPayload -ContentType "application/json"
    Write-Host "Success! Record created with ID: $($response.data)"
    $recordId = $response.data
} catch {
    Write-Host "Error: $_"
}

# Test 2: Get the created record
if ($recordId) {
    Write-Host "\nTest 2: Getting the created record..."
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/records/$recordId" -Method Get
        Write-Host "Success! Record details: $($response.data | ConvertTo-Json -Compress)"
    } catch {
        Write-Host "Error: $_"
    }
}

Write-Host "\nAPI tests completed."
