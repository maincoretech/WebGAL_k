use std::sync::Arc;

type PackRef = Arc<hexz_k::ResourcePack>;

fn find_hexz() -> Option<std::path::PathBuf> {
  let exe_dir = std::env::current_exe()
    .ok()
    .and_then(|p| p.parent().map(|d| d.to_path_buf()))
    .unwrap_or_else(|| std::path::PathBuf::from("."));

  let mut dirs: Vec<std::path::PathBuf> = vec![
    exe_dir.clone(),
    exe_dir.join(".."),
  ];
  // macOS .app bundle: Contents/MacOS/ → 3 levels up
  #[cfg(target_os = "macos")]
  dirs.extend(exe_dir.parent().and_then(|p| p.parent()).and_then(|p| p.parent()).map(|d| d.to_path_buf()));
  for d in &dirs {
    let p = d.join("game.hxz");
    if p.exists() { return Some(p); }
  }
  None
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  use tauri::Manager;
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      #[cfg(desktop)]
      let _ = app.handle().plugin(tauri_plugin_window_state::Builder::default().build());

      if let Some(path) = find_hexz() {
        let pw = std::env::var("HEXZ_PASSWORD").ok();
        if let Ok(pack) = hexz_k::ResourcePack::open(&path, pw.as_deref()) {
          app.handle().manage(Arc::new(pack));
        }
      }
      Ok(())
    })
    .register_asynchronous_uri_scheme_protocol("hexz", hexz_protocol)
    .invoke_handler(tauri::generate_handler![read_hexz_file])
    .plugin(tauri_plugin_persisted_scope::init())
    .plugin(tauri_plugin_process::init())
    .run(tauri::generate_context!())
    .expect("error while running webgal-k");
}

fn hexz_protocol(
  ctx: tauri::UriSchemeContext<'_, tauri::Wry>,
  request: http::Request<Vec<u8>>,
  responder: tauri::UriSchemeResponder,
) {
  use tauri::Manager;
  let path = request.uri().path().trim_start_matches('/').to_string();
  let path = urlencoding::decode(&path).unwrap_or(std::borrow::Cow::Borrowed(&path)).into_owned();
  let handle = ctx.app_handle().clone();
  std::thread::spawn(move || {
    let pack: tauri::State<'_, PackRef> = handle.state();
    match pack.read_file(&path) {
      Ok(data) => {
        let mime = mime_guess::from_path(&path).first_or_octet_stream();
        responder.respond(
          http::Response::builder()
            .header(http::header::CONTENT_TYPE, mime.essence_str())
            .header("Access-Control-Allow-Origin", "*")
            .status(http::StatusCode::OK)
            .body(data)
            .unwrap(),
        );
      }
      Err(_) => {
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
  state.read_file(&decoded).map_err(|e| e.to_string())
}
