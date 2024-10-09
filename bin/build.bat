@echo off
setlocal

:: 设置脚本所在目录为当前目录（可选，确保在 bin 目录下运行）
cd /d %~dp0

echo 正在检查 dist 目录...
:: 如果 dist 目录存在，先删除它
IF EXIST ..\dist (
    echo 发现已有 dist 目录，正在删除...
    rmdir /s /q ..\dist
    IF %ERRORLEVEL% == 0 (
        echo dist 目录已删除！
    ) ELSE (
        echo 删除 dist 目录失败！错误代码：%ERRORLEVEL%
        pause
        exit /b %ERRORLEVEL%
    )
)

echo 正在打包 Vue 项目...
:: 打包 Vue 项目
npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo 项目打包失败！错误代码：%ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)

echo 项目打包成功，正在压缩 dist 文件夹...
:: 压缩 dist 文件夹为 dist.zip
powershell -Command "Compress-Archive -Path ..\dist -DestinationPath ..\dist.zip"
IF %ERRORLEVEL% NEQ 0 (
    echo 压缩 dist 文件夹失败！错误代码：%ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)

echo dist 文件夹压缩成功，正在删除 dist 文件夹...
rmdir /s /q ..\dist
IF %ERRORLEVEL% == 0 (
    echo dist 文件夹已删除！
) ELSE (
    echo 删除 dist 文件夹失败！错误代码：%ERRORLEVEL%
)

:: 暂停，等待用户按键
pause
