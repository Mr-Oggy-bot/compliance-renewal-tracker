@echo off
title Compliance Tracker - Frontend Client
cd /d "%~dp0frontend"
echo Starting Frontend Client on http://localhost:5173 ...
call npm.cmd run dev
pause
