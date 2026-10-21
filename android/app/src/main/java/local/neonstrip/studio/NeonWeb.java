package local.neonstrip.studio;
import android.content.Context;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import org.json.JSONObject;
final class NeonWeb {
 static WebView create(Context context, boolean player, Object bridge) {
  WebView view=new WebView(context);WebSettings settings=view.getSettings();
  settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setAllowFileAccess(false);settings.setAllowContentAccess(false);
  view.setBackgroundColor(0xff05070b);view.setWebContentsDebuggingEnabled(false);
  if(bridge!=null)view.addJavascriptInterface(bridge,"AndroidHost");
  view.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView web,WebResourceRequest request){return true;}
   @Override public void onPageFinished(WebView web,String url){
    String design=context.getSharedPreferences("neon",Context.MODE_PRIVATE).getString("design",null);
    if(design!=null)web.evaluateJavascript("window.loadNeonDesign("+JSONObject.quote(design)+")",null);
    if(!player)web.evaluateJavascript("(()=>{const b=document.createElement('button');b.textContent='Android screensaver settings';b.onclick=()=>AndroidHost.openSettings();document.querySelector('aside').prepend(b);document.getElementById('video').disabled=true;document.getElementById('video').textContent='Export video from desktop';})()",null);
   }
  });
  // Only bundled assets are navigated; network access is used solely for the WLED socket.
  view.loadUrl("file:///android_asset/index.html"+(player?"?player=1":""));
  return view;
 }
}
