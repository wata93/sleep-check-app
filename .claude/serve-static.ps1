param(
  [string]$Root = $PSScriptRoot,
  [int]$Port = 8790
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root on http://localhost:$Port/"

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $req = $context.Request
  $res = $context.Response
  $path = $req.Url.LocalPath
  if ($path -eq "/") { $path = "/index.html" }
  $filePath = Join-Path $Root ($path.TrimStart("/"))

  if (Test-Path $filePath -PathType Leaf) {
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    if ($filePath -like "*.html") { $res.ContentType = "text/html; charset=utf-8" }
    elseif ($filePath -like "*.css") { $res.ContentType = "text/css; charset=utf-8" }
    elseif ($filePath -like "*.js") { $res.ContentType = "application/javascript; charset=utf-8" }
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $res.StatusCode = 404
  }
  $res.OutputStream.Close()
}
