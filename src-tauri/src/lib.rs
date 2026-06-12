#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  use tauri::Manager;
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      #[cfg(desktop)]
      let _ = app.handle().plugin(tauri_plugin_window_state::Builder::default().build());

      // Mount .hxz resource pack from exe directory
      let exe_dir = std::env::current_exe()
        .ok().and_then(|p| p.parent().map(|d| d.to_path_buf()))
        .unwrap_or_else(|| std::path::PathBuf::from("."));
      let pack_path = exe_dir.join("game.hxz");

      if pack_path.exists() {
        let pw = std::env::var("HEXZ_PASSWORD").ok();
        if let Ok(pack) = hexz_k::ResourcePack::open(&pack_path, pw.as_deref()) {
          app.handle().manage(pack);
        }
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![read_hxz_file])
    .plugin(tauri_plugin_persisted_scope::init())
    .plugin(tauri_plugin_process::init())
    .run(tauri::generate_context!())
    .expect("error while running webgal-k");
}

#[tauri::command]
fn read_hxz_file(path: String, state: tauri::State<'_, hexz_k::ResourcePack>) -> Result<Vec<u8>, String> {
  state.read_file(&path).map_err(|e| e.to_string())
}
