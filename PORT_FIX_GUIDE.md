# Port 4000 Fix Guide

## Issue
Your server is configured to use port 4000, but you're getting "EADDRINUSE: address already in use :::4000" error.

## Solutions

### Solution 1: Kill the Process Using Port 4000 (Recommended)

#### Windows PowerShell:
```powershell
# Step 1: Find the process using port 4000
netstat -ano | findstr :4000

# Step 2: Look for the PID (Process ID) in the output
# Example output: TCP    0.0.0.0:4000    0.0.0.0:0    LISTENING    12345
#                                          Process ID ^^^^^

# Step 3: Kill the process (replace 12345 with your actual PID)
taskkill /PID 12345 /F
```

#### Windows Command Prompt:
```cmd
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Solution 2: Change Port (If you prefer)

1. Update `.env` file:
   ```
   PORT=4001
   ```

2. The server will automatically use the new port.

### Solution 3: Check if Nodemon is Running

Sometimes nodemon keeps the old process running. Try:
1. Close all terminal windows
2. Restart your terminal
3. Run `npm run dev` again

## Verification

After fixing, your server should start successfully:
```
🚀 Server running on port 4000
🔌 Socket.IO server ready for real-time connections
🕐 Alert scheduler started for maintenance and overdue trip monitoring
✅ MongoDB Connected
```

## Note

The `socket-test.html` file uses port 4000 by default. If you change the port, make sure to update the HTML file's server URL field.
