package local.neonstrip.studio;
import android.service.dreams.DreamService;
import android.webkit.WebView;
public final class NeonDream extends DreamService {
 private WebView web;
 @Override public void onAttachedToWindow(){super.onAttachedToWindow();setInteractive(false);setFullscreen(true);setScreenBright(false);web=NeonWeb.create(this,true,null);setContentView(web);}
 @Override public void onDreamingStopped(){if(web!=null){web.evaluateJavascript("window.setNeonPaused(true)",null);web.onPause();}super.onDreamingStopped();}
 @Override public void onDreamingStarted(){super.onDreamingStarted();if(web!=null){web.onResume();web.evaluateJavascript("window.setNeonPaused(false)",null);}}
 @Override public void onDetachedFromWindow(){if(web!=null){web.destroy();web=null;}super.onDetachedFromWindow();}
}
