mod hexz;

use hexz::ResourcePack;
use std::sync::{Arc, atomic::{AtomicBool, Ordering}};
use tauri::Manager;
use tauri::Emitter;

type PackRef = Arc<Option<ResourcePack>>;

fn find_hexz() -> Option<std::path::PathBuf> {
  let exe_dir = std::env::current_exe()
    .ok()
    .and_then(|p| p.parent().map(|d| d.to_path_buf()))
    .unwrap_or_else(|| std::path::PathBuf::from("."));

  let mut dirs: Vec<std::path::PathBuf> = vec![
    exe_dir.clone(),
    std::env::current_dir().unwrap_or_default(),
  ];
  // macOS .app bundle: Contents/MacOS/ → 3 levels up
  #[cfg(target_os = "macos")]
  {
    let app_root = exe_dir
      .parent().and_then(|p| p.parent())
      .and_then(|p| p.parent())
      .map(|d| d.to_path_buf());
    dirs.extend(app_root);
    dirs.push(exe_dir.join(".."));
  }
  for d in &dirs {
    let p = d.join("game.hxz");
    if p.exists() { return Some(p); }
  }
  None
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      #[cfg(desktop)]
      let _ = app.handle().plugin(tauri_plugin_window_state::Builder::default().build());

      let pw = option_env!("HEXZ_PASSWORD").filter(|s| !s.is_empty()).map(|s| s.to_string());
      let pack = find_hexz()
        .and_then(|p| ResourcePack::open(&p, pw.as_deref()).ok());
      let loaded = pack.is_some();
      app.handle().manage(Arc::new(pack));
      app.handle().manage(PackStatus(loaded));

      let close_allowed = Arc::new(AtomicBool::new(false));
      app.handle().manage(CloseGuard(close_allowed.clone()));
      Ok(())
    })
    .on_window_event(|window, event| {
      if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        let guard = window.state::<CloseGuard>();
        if !guard.0.load(Ordering::Relaxed) {
          api.prevent_close();
          let _ = window.emit("hexz-before-close", ());
        }
      }
    })
    .register_asynchronous_uri_scheme_protocol("hexz", hexz_protocol)
    .on_page_load(|webview, _| {
      let loaded = webview.state::<PackStatus>().0;
      if !loaded {
        let _ = webview.eval(ERROR_SCRIPT);
      }
    })
    .invoke_handler(tauri::generate_handler![read_hexz_file, allow_close])
    .plugin(tauri_plugin_persisted_scope::init())
    .plugin(tauri_plugin_process::init())
    .run(tauri::generate_context!())
    .expect("error while running webgal-k");
}

struct PackStatus(bool);
struct CloseGuard(Arc<AtomicBool>);

const ERROR_SCRIPT: &str = r#"
(function(){
  var zh=/^zh\b/i.test(navigator.language);
  var t=zh?'游戏资源不完整，请重新下载'
         :'Game resources incomplete, please re-download';
  var s=zh?'将 game.hxz 放在可执行文件同级目录'
         :'Place game.hxz alongside the executable';
  var d=document.createElement('div');
  d.innerHTML=
    '<div style="position:fixed;inset:0;display:flex;align-items:center;'
   +'justify-content:center;z-index:9999;background:rgba(0,0,0,0.92)">'
   +'<div style="position:relative;background:rgba(20,20,20,0.95);'
   +'padding:40px 48px;text-align:center;'
   +'font-family:-apple-system,sans-serif;max-width:420px">'
   +'<div onclick="window.__TAURI_INTERNALS__.invoke(\'plugin:process|exit\',{code:0})"'
   +' style="position:absolute;top:12px;right:14px;cursor:pointer;'
   +'color:rgba(255,255,255,0.3);font-size:18px;line-height:1;user-select:none" title="Exit">✕</div>'
   +'<div style="font-size:48px;margin-bottom:16px">📦</div>'
   +'<div style="color:#fff;font-size:17px;font-weight:500;margin-bottom:8px">'+t+'</div>'
   +'<div style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.6">'+s+'</div>'
   +'</div></div>';
  document.body.appendChild(d);
})();
"#;

fn hexz_protocol(
  ctx: tauri::UriSchemeContext<'_, tauri::Wry>,
  request: http::Request<Vec<u8>>,
  responder: tauri::UriSchemeResponder,
) {
  let path = request.uri().path().trim_start_matches('/').to_string();
  let path = urlencoding::decode(&path).unwrap_or(std::borrow::Cow::Borrowed(&path)).into_owned();
  let handle = ctx.app_handle().clone();
  std::thread::spawn(move || {
    let pack: tauri::State<'_, PackRef> = handle.state();
    let result = pack.as_ref().as_ref().and_then(|p| p.read_file(&path).ok());
    match result {
      Some(data) => {
        let mime = mime_guess::from_path(&path).first_or_octet_stream();
        let len = data.len();
        responder.respond(
          http::Response::builder()
            .header(http::header::CONTENT_TYPE, mime.essence_str())
            .header(http::header::CONTENT_LENGTH, len)
            .header("Access-Control-Allow-Origin", "*")
            .status(http::StatusCode::OK)
            .body(data)
            .unwrap(),
        );
      }
      None => {
        responder.respond(
          http::Response::builder()
            .status(http::StatusCode::NOT_FOUND)
            .header("Access-Control-Allow-Origin", "*")
            .body(Vec::new())
            .unwrap(),
        );
      }
    }
  });
}

#[tauri::command]
fn read_hexz_file(path: String, state: tauri::State<'_, PackRef>) -> Result<Vec<u8>, String> {
  let decoded = urlencoding::decode(&path).unwrap_or(std::borrow::Cow::Borrowed(&path)).into_owned();
  state.as_ref().as_ref()
    .ok_or("pack not loaded".into())
    .and_then(|p| p.read_file(&decoded).map_err(|e| e.to_string()))
}

#[tauri::command]
fn allow_close(state: tauri::State<'_, CloseGuard>, window: tauri::Window) {
  state.0.store(true, Ordering::Relaxed);
  let _ = window.close();
}
