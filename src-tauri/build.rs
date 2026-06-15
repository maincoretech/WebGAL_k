use std::env;
use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();
    if let Ok(pw) = env::var("HEXZ_PASSWORD") {
        let seed = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .subsec_nanos() as u64;
        let masked: Vec<String> = pw
            .bytes()
            .enumerate()
            .map(|(i, b)| format!("{}", b ^ seed.wrapping_mul(i as u64 + 1) as u8))
            .collect();
        let code = format!(
            "const MASKED: &[u8] = &[{}]; const SEED: u64 = {}; pub fn decode() -> Option<&'static str> {{ if MASKED.is_empty() {{ return None; }} let mut s = String::with_capacity(MASKED.len()); for (i, &b) in MASKED.iter().enumerate() {{ s.push((b ^ SEED.wrapping_mul(i as u64 + 1) as u8) as char); }} Some(Box::leak(s.into_boxed_str())) }}",
            masked.join(","),
            seed
        );
        fs::write(format!("{out_dir}/password.rs"), code).ok();
    } else {
        fs::write(
            format!("{out_dir}/password.rs"),
            "pub fn decode() -> Option<&'static str> { None }",
        )
        .ok();
    }
    tauri_build::build()
}
