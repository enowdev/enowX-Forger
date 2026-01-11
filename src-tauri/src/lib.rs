mod icon_generator;

use icon_generator::{GenerateRequest, GenerateResult};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn generate_icons(request: GenerateRequest) -> GenerateResult {
    icon_generator::generate_icons(&request)
}

#[tauri::command]
fn get_default_output_path() -> String {
    dirs::document_dir()
        .or_else(dirs::home_dir)
        .map(|p| p.join("enowX-Forger-Output").to_string_lossy().to_string())
        .unwrap_or_else(|| "./output".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            generate_icons,
            get_default_output_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
