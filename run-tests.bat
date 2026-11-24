@echo off
title Compliance Tracker - Automated Test Suite
cd /d "%~dp0backend"
echo Running Compliance Test Suite ...
node --test tests/**/*.test.js
pause
