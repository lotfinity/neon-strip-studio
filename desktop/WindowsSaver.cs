using System;
using System.IO;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Forms;
class WindowsSaver {
 [DllImport("user32.dll")] static extern IntPtr SetParent(IntPtr child,IntPtr parent);
 [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr h,out RECT r);
 [DllImport("user32.dll")] static extern bool MoveWindow(IntPtr h,int x,int y,int w,int height,bool repaint);
 [DllImport("user32.dll")] static extern int GetWindowLong(IntPtr h,int index);
 [DllImport("user32.dll")] static extern int SetWindowLong(IntPtr h,int index,int value);
 struct RECT { public int left,top,right,bottom; }
 [STAThread] static void Main(string[] args){
 if(args.Length==3&&args[0]=="--embed"){IntPtr child=new IntPtr(long.Parse(args[1])),parent=new IntPtr(long.Parse(args[2]));SetWindowLong(child,-16,(GetWindowLong(child,-16)&~unchecked((int)0x80000000))|0x40000000);SetParent(child,parent);RECT r;if(GetClientRect(parent,out r))MoveWindow(child,0,0,r.right,r.bottom,true);return;}
 string root=Path.GetDirectoryName(Application.ExecutablePath),exe=Path.Combine(root,"NeonStripStudio.exe"),mode="";
 if(args.Length>0){string a=args[0].ToLowerInvariant();if(a.StartsWith("/s"))mode="--saver";else if(a.StartsWith("/p")){string handle=a.Contains(":")?a.Substring(a.IndexOf(':')+1):(args.Length>1?args[1]:"");long n;if(!long.TryParse(handle,out n))return;mode="--player --preview="+n;}}
 if(!File.Exists(exe)){MessageBox.Show("Keep NeonStrip.scr beside NeonStripStudio.exe and its supporting files.","Neon Strip Studio");return;}
 try{using(Process p=Process.Start(new ProcessStartInfo(exe,mode){WorkingDirectory=root,UseShellExecute=false})){p.WaitForExit();}}catch(Exception e){MessageBox.Show(e.Message,"Neon Strip Studio");}
 }
}
