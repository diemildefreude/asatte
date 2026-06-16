param(
    [Parameter(Mandatory=$true)]
    [string]$Query
)

# We use Node.js to process the file because PowerShell 5.1 cannot handle deeply nested JSON reliably
node "c:\xampp\htdocs\website\netart\search-chat.cjs" $Query
