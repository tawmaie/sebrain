use tauri::{

    menu::{Menu, MenuItem},

    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},

    Manager, RunEvent, WindowEvent,

};

use tauri::LogicalSize;



const MINI_WINDOW_WIDTH: f64 = 300.0;

const MINI_WINDOW_HEIGHT: f64 = 300.0;



fn hide_secondary_windows(app: &tauri::AppHandle) {

    if let Some(work_log) = app.get_webview_window("work-log") {

        let _ = work_log.hide();

    }

    if let Some(task_detail) = app.get_webview_window("task-detail") {

        let _ = task_detail.hide();

    }

}



fn enter_mini_mode(app: &tauri::AppHandle) {

    let Some(mini) = app.get_webview_window("mini") else {

        return;

    };



    let _ = mini.set_size(LogicalSize::new(MINI_WINDOW_WIDTH, MINI_WINDOW_HEIGHT));

    let _ = mini.set_always_on_top(true);

    let _ = mini.show();

    let _ = mini.set_focus();



    if let Some(main) = app.get_webview_window("main") {

        let _ = main.hide();

    }

}



fn exit_mini_mode(app: &tauri::AppHandle) {

    if let Some(mini) = app.get_webview_window("mini") {

        let _ = mini.hide();

    }



    hide_secondary_windows(app);



    if let Some(main) = app.get_webview_window("main") {

        let _ = main.show();

        let _ = main.unminimize();

        let _ = main.set_focus();

    }

}



fn toggle_mini_window(app: &tauri::AppHandle) {

    let Some(mini) = app.get_webview_window("mini") else {

        return;

    };



    let visible = mini.is_visible().unwrap_or(false);

    if visible {

        exit_mini_mode(app);

    } else {

        enter_mini_mode(app);

    }

}



fn show_main_window(app: &tauri::AppHandle) {

    if let Some(mini) = app.get_webview_window("mini") {

        let _ = mini.hide();

    }



    hide_secondary_windows(app);



    if let Some(main) = app.get_webview_window("main") {

        let _ = main.show();

        let _ = main.set_focus();

        let _ = main.unminimize();

    }

}



#[cfg_attr(mobile, tauri::mobile_entry_point)]

pub fn run() {

    tauri::Builder::default()

        .plugin(tauri_plugin_sql::Builder::new().build())

        .plugin(tauri_plugin_opener::init())

        .plugin(tauri_plugin_notification::init())

        .setup(|app| {

            let toggle_mini =

                MenuItem::with_id(app, "toggle_mini", "เปิด Mini Timer", true, None::<&str>)?;

            let show_main =

                MenuItem::with_id(app, "show_main", "แสดง SeBrain", true, None::<&str>)?;

            let quit = MenuItem::with_id(app, "quit", "ออกจากแอป", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&toggle_mini, &show_main, &quit])?;



            let icon = app

                .default_window_icon()

                .expect("missing default window icon")

                .clone();



            TrayIconBuilder::new()

                .icon(icon)

                .menu(&menu)

                .show_menu_on_left_click(false)

                .on_menu_event(|app, event| match event.id.as_ref() {

                    "toggle_mini" => toggle_mini_window(app),

                    "show_main" => show_main_window(app),

                    "quit" => {

                        app.exit(0);

                    }

                    _ => {}

                })

                .on_tray_icon_event(|tray, event| {

                    if let TrayIconEvent::Click {

                        button: MouseButton::Left,

                        button_state: MouseButtonState::Up,

                        ..

                    } = event

                    {

                        toggle_mini_window(tray.app_handle());

                    }

                })

                .build(app)?;



            if let Some(main) = app.get_webview_window("main") {

                let app_handle = app.handle().clone();

                main.on_window_event(move |event| {

                    if let WindowEvent::CloseRequested { .. } = event {

                        for label in ["mini", "work-log", "task-detail"] {

                            if let Some(window) = app_handle.get_webview_window(label) {

                                let _ = window.close();

                            }

                        }

                    }

                });

            }



            Ok(())

        })

        .build(tauri::generate_context!())

        .expect("error while running tauri application")

        .run(|app_handle, event| {

            if let RunEvent::ExitRequested { .. } = event {

                for label in ["mini", "work-log", "task-detail"] {

                    if let Some(window) = app_handle.get_webview_window(label) {

                        let _ = window.close();

                    }

                }

            }

        });

}


