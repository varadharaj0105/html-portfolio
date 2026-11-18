package in.varadharaj.neongrid;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.view.WindowInsets;
import android.os.Build;

public class GameActivity extends Activity {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        WebView game = new WebView(this);
        game.setBackgroundColor(0xff101420);
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        if (Build.VERSION.SDK_INT >= 30) {
            game.setOnApplyWindowInsetsListener((view, window) -> {
                android.graphics.Insets bars = window.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return window;
            });
        }
        setContentView(game);
        game.loadUrl("file:///android_asset/index.html");
    }
}
