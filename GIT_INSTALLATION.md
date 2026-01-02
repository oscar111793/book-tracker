# Git Installation Guide for Windows

Git is not currently installed on your system. Follow these steps to install it:

## Option 1: Download Git for Windows (Recommended)

1. **Visit the official Git website:**
   - Go to: https://git-scm.com/download/win
   - The download will start automatically

2. **Run the installer:**
   - Double-click the downloaded `.exe` file
   - Follow the installation wizard

3. **Important Installation Options:**
   - ✅ **"Add Git to PATH"** - Make sure this is checked (usually selected by default)
   - Choose your preferred editor (VS Code, Notepad++, etc.)
   - Use default options for most other settings

4. **Complete the installation:**
   - Click "Install"
   - Wait for installation to complete
   - Click "Finish"

5. **Restart your terminal/PowerShell:**
   - Close and reopen PowerShell or Cursor's terminal
   - Verify installation: `git --version`

## Option 2: Using Chocolatey (If Installed)

If you have Chocolatey package manager installed:

```powershell
choco install git -y
```

Then restart your terminal.

## Option 3: Using Scoop (If Installed)

If you have Scoop package manager installed:

```powershell
scoop install git
```

Then restart your terminal.

## Verify Installation

After installation, restart your terminal and run:

```powershell
git --version
```

You should see output like: `git version 2.xx.x`

## After Installation

Once Git is installed, you can:

1. **Initialize a repository** (if not already done):
   ```powershell
   git init
   ```

2. **Configure Git** (first time only):
   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Check status:**
   ```powershell
   git status
   ```

## Troubleshooting

### Git still not recognized after installation

1. **Restart your terminal** - This is the most common fix
2. **Restart Cursor/VS Code** - Sometimes the IDE needs a restart
3. **Check PATH manually:**
   - Open System Properties → Environment Variables
   - Check if `C:\Program Files\Git\cmd` is in your PATH
   - If not, add it manually

### Need to add Git to PATH manually

1. Open "Environment Variables" in Windows
2. Edit "Path" variable
3. Add: `C:\Program Files\Git\cmd`
4. Restart terminal

## Quick Test

After installation and restart, test with:

```powershell
git --version
git config --global --list
```

If both commands work, Git is successfully installed!


