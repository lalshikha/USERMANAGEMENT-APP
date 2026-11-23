# Load every key=value from .env into the current PowerShell session
Get-Content .env | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
}

# Allow n8n nodes to read $env variables
$env:N8N_BLOCK_ENV_ACCESS_IN_NODE = "false"

# Start n8n
n8n start