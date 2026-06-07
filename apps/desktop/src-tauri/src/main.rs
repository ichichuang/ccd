fn main() {
    if let Err(error) = run_desktop() {
        eprintln!("[ccd-desktop] fatal runtime error: {error}");
        std::process::exit(1);
    }
}

fn run_desktop() -> tauri::Result<()> {
    eprintln!("[ccd-desktop] initializing Tauri runtime");

    tauri::Builder::default()
        .setup(|_app| {
            eprintln!("[ccd-desktop] Tauri setup complete");
            Ok(())
        })
        .run(tauri::generate_context!())
}
