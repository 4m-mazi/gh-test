fn main() {
    println!("Hello, world!!!");
    if cfg!(target_os = "macos") {
        println!("You are running macos!");
    } else if cfg!(target_os = "linux") {
        println!("You are running linux!");
    } else if cfg!(target_os = "windows") {
        println!("You are running windows!");
    }
}
