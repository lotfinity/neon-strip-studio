#!/usr/bin/env python3
"""Start the player on GNOME idle, stop on activity or lock. Never alters locking."""
import os, re, subprocess, sys, time
from pathlib import Path
root=Path(__file__).resolve().parent
threshold=int(os.environ.get('NEON_IDLE_SECONDS','120'))*1000
def call(dest,obj,method):
    return subprocess.check_output(['gdbus','call','--session','--dest',dest,'--object-path',obj,'--method',method],text=True,stderr=subprocess.PIPE,timeout=4)
def idle():
    result=call('org.gnome.Mutter.IdleMonitor','/org/gnome/Mutter/IdleMonitor/Core','org.gnome.Mutter.IdleMonitor.GetIdletime')
    nums=re.findall(r'\d+',result.replace('uint64',''))
    if not nums: raise RuntimeError('Unrecognized GNOME idle response')
    return int(nums[0])
def locked():
    return 'true' in call('org.gnome.ScreenSaver','/org/gnome/ScreenSaver','org.gnome.ScreenSaver.GetActive')
player=None;fired=False
try:
    while True:
        try:
            millis=idle();active=locked()
        except Exception as error:
            if player and player.poll() is None: player.terminate()
            player=None
            print('GNOME idle integration unavailable:',error,file=sys.stderr,flush=True)
            time.sleep(15);continue
        if millis<2000: fired=False
        if player and player.poll() is None and (active or millis<2000):
            player.terminate();player.wait(timeout=5);player=None
        if not active and millis>=threshold and not fired:
            player=subprocess.Popen([str(root/'NeonStripStudio'),'--saver'],cwd=root)
            fired=True
        time.sleep(1)
finally:
    if player and player.poll() is None: player.terminate()
