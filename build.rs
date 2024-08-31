use git2::{DescribeFormatOptions, DescribeOptions, Repository};

fn main() {
    let Ok(repo) = Repository::open(".").map_err(|e| {
        println!("cargo::warning={}", e);
        e
    }) else {
        return;
    };
    let Ok(git_describe_result) = repo
        .describe(
            DescribeOptions::new()
                .describe_tags()
                .show_commit_oid_as_fallback(true),
        )
        .and_then(|describe| {
            describe.format(Some(
                DescribeFormatOptions::new()
                    .always_use_long_format(true)
                    .dirty_suffix("-dirty"),
            ))
        }).map_err(|e| {
            println!("cargo::warning={}", e);
            e
        })
    else {
        return;
    };
    println!("cargo::rustc-env=GIT_DESCRIBE={git_describe_result}")
}
