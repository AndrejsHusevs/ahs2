# Define the source and destination paths
$sourceBuild = "build\*"
$sourceGraphQL = "graphql"
$sourceHtaccess = ".htaccess"
$sourceVendor = "vendor"
$sourceComposerJson = "composer.json"
$sourceComposerLock = "composer.lock"
$sourcePublic = "public\*"
$sourceConfig = "src\config.js"
$destination = "C:\xampp\htdocs"

# Run composer dump-autoload
Write-Host "Running composer dump-autoload..."
Start-Process -NoNewWindow -Wait -FilePath "composer" -ArgumentList "dump-autoload"

# Run npm run build
Write-Host "Running npm run build..."
Start-Process -NoNewWindow -Wait -FilePath "npm" -ArgumentList "run build"


# Copy the build folder
Write-Host "Copying build folder..."
Copy-Item -Path $sourceBuild -Destination $destination -Recurse -Force

# Copy the graphql folder
Write-Host "Copying graphql folder..."
Copy-Item -Path $sourceGraphQL -Destination "$destination" -Recurse -Force

# Copy the .htaccess file
Write-Host "Copying .htaccess file..."
Copy-Item -Path $sourceHtaccess -Destination $destination -Force

# Copy the vendor folder
Write-Host "Copying vendor folder..."
Copy-Item -Path $sourceVendor -Destination "$destination" -Recurse -Force

# Copy the composer.json file
Write-Host "Copying composer.json file..."
Copy-Item -Path $sourceComposerJson -Destination $destination -Force

# Copy the composer.lock file
Write-Host "Copying composer.lock file..."
Copy-Item -Path $sourceComposerLock -Destination $destination -Force

# Copy the public folder
Write-Host "Copying public folder..."
Copy-Item -Path $sourcePublic -Destination "$destination\public" -Recurse -Force

# Copy the config.js file
Write-Host "Copying config.js file..."
Copy-Item -Path $sourceConfig -Destination "$destination\src" -Force

Write-Host "Deployment completed successfully."