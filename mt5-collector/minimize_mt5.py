"""
Helper para minimizar janela do MT5 automaticamente
"""
import win32gui
import win32con
import time

def minimize_mt5_window():
    """Minimiza todas as janelas do MT5"""
    def callback(hwnd, windows):
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetWindowText(hwnd)
            if 'MetaTrader' in title or 'terminal64' in title.lower():
                # Minimizar para bandeja
                win32gui.ShowWindow(hwnd, win32con.SW_MINIMIZE)
                windows.append(hwnd)
        return True

    windows = []
    win32gui.EnumWindows(callback, windows)
    return len(windows)

if __name__ == "__main__":
    print("Minimizando janelas do MT5...")
    count = minimize_mt5_window()
    print(f"✅ {count} janelas minimizadas")
