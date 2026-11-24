@echo off
title Compliance Tracker - Backend Server
cd /d "%~dp0backend"
echo Starting Backend API Server on http://localhost:5000 ...
node src/server.js
pause
