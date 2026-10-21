package local.neonstrip.studio;
import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.webkit.WebView;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import org.json.JSONObject;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
public final class MainActivity extends Activity {
 private WebView web; private String exportData;
 @Override public void onCreate(Bundle saved){super.onCreate(saved);web=NeonWeb.create(this,false,new Bridge());setContentView(web);}
 final class Bridge {
  @JavascriptInterface public void saveDesign(String value){if(value.length()<=12000000)getSharedPreferences("neon",MODE_PRIVATE).edit().putString("design",value).apply();}
  @JavascriptInterface public void importDesign(){runOnUiThread(()->{Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.setType("*/*");i.addCategory(Intent.CATEGORY_OPENABLE);startActivityForResult(i,10);});}
  @JavascriptInterface public void exportText(String name,String value){if(value.length()>12000000)return;runOnUiThread(()->{exportData=value;Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.setType("application/json");i.addCategory(Intent.CATEGORY_OPENABLE);i.putExtra(Intent.EXTRA_TITLE,"my-neon-strip.json");startActivityForResult(i,11);});}
  @JavascriptInterface public void openSettings(){runOnUiThread(()->{try{startActivity(new Intent("android.settings.DREAM_SETTINGS"));}catch(Exception e){Toast.makeText(MainActivity.this,"This device does not expose Android screensaver settings.",Toast.LENGTH_LONG).show();}});}
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(result!=RESULT_OK||data==null||data.getData()==null)return;try{
  if(request==10){String text;try(InputStream input=getContentResolver().openInputStream(data.getData());ByteArrayOutputStream out=new ByteArrayOutputStream()){byte[] buffer=new byte[8192];int n,total=0;while((n=input.read(buffer))!=-1){total+=n;if(total>12000000)throw new Exception("File too large");out.write(buffer,0,n);}text=out.toString("UTF-8");}web.evaluateJavascript("window.loadNeonDesign("+JSONObject.quote(text)+")",null);}
  if(request==11&&exportData!=null){try(OutputStream out=getContentResolver().openOutputStream(data.getData())){out.write(exportData.getBytes(StandardCharsets.UTF_8));}exportData=null;Toast.makeText(this,"Design saved",Toast.LENGTH_SHORT).show();}
 }catch(Exception e){Toast.makeText(this,"Cannot open or save: "+e.getMessage(),Toast.LENGTH_LONG).show();}}
 @Override protected void onPause(){super.onPause();web.evaluateJavascript("window.setNeonPaused(true)",null);web.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null){web.onResume();web.evaluateJavascript("window.setNeonPaused(false)",null);}}
 @Override protected void onDestroy(){if(web!=null){web.removeJavascriptInterface("AndroidHost");web.destroy();}super.onDestroy();}
}
