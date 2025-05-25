#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      #[cfg(desktop)]
      app.handle().plugin(tauri_plugin_window_state::Builder::default().build());
      Ok(())
    })
    .plugin(tauri_plugin_persisted_scope::init())
    .plugin(tauri_plugin_process::init())
    .run(tauri::generate_context!())
    .expect("error while running webgal-k");
}
