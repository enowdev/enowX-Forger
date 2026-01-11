mod icon_generator;

use icon_generator::{GenerateRequest, GenerateResult, ProgressEvent};
use tauri::{AppHandle, Emitter};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn generate_icons(app: AppHandle, request: GenerateRequest) -> GenerateResult {
    let app_for_progress = app.clone();
    let app_for_complete = app.clone();
    
    // Run in blocking thread to not freeze UI
    let result = tokio::task::spawn_blocking(move || {
        icon_generator::generate_icons_with_progress(&request, |progress: ProgressEvent| {
            let _ = app_for_progress.emit("generate-progress", &progress);
        })
    })
    .await
    .unwrap_or_else(|e| GenerateResult {
        success: false,
        generated: vec![],
        failed: vec![icon_generator::FailedIcon {
            name: "task".to_string(),
            error: e.to_string(),
        }],
        output_path: String::new(),
        template_name: String::new(),
    });

    // Emit completion event
    let _ = app_for_complete.emit("generate-complete", &result);
    
    result
}

#[tauri::command]
fn get_default_output_path() -> String {
    dirs::document_dir()
        .or_else(dirs::home_dir)
        .map(|p| p.join("enowX-Forger-Output").to_string_lossy().to_string())
        .unwrap_or_else(|| "./output".to_string())
}

#[tauri::command]
async fn open_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
fn get_current_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            generate_icons,
            get_default_output_path,
            open_folder,
            get_current_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
