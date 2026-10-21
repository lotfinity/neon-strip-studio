#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
command -v python3 >/dev/null
command -v gdbus >/dev/null
chmod +x "$ROOT/NeonStripStudio" "$ROOT/gnome-idle.py"
for helper in chrome_crashpad_handler chrome-sandbox; do
    if [ -f "$ROOT/$helper" ]; then chmod +x "$ROOT/$helper"; fi
done
mkdir -p "$HOME/.config/autostart" "$HOME/.local/share/applications"
python3 - "$ROOT" <<'PY'
import sys
from pathlib import Path
root=Path(sys.argv[1])
def quote(path): return '"'+str(path).replace('\\','\\\\').replace('"','\\"').replace('`','\\`').replace('$','\\$').replace('%','%%')+'"'
base='[Desktop Entry]\nType=Application\nTerminal=false\n'
(Path.home()/'.config/autostart/neon-strip-idle.desktop').write_text(base+'Name=Neon Strip idle player\nExec=python3 '+quote(root/'gnome-idle.py')+'\nX-GNOME-Autostart-enabled=true\n')
(Path.home()/'.local/share/applications/neon-strip-studio.desktop').write_text(base+'Name=Neon Strip Studio\nExec='+quote(root/'NeonStripStudio')+'\nCategories=Graphics;\n')
PY
printf '%s\n' 'Installed editor shortcut and idle startup for your next login.' 'Test now: python3 ./gnome-idle.py' 'Starts after 120 seconds idle; GNOME locking and blanking remain unchanged.' 'Remove ~/.config/autostart/neon-strip-idle.desktop to uninstall idle startup.'
